import express from 'express'
import db from '../db/index.js'
import { authenticateToken } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // 1. Stats
    const statsQuery = await Promise.all([
      db.query('SELECT COUNT(*) FROM employees WHERE is_active = true'),
      db.query("SELECT COUNT(*) FROM car_bookings WHERE start_date <= $1 AND end_date >= $1 AND status IN ('approved', 'in-use')", [today]),
      db.query("SELECT COUNT(*) FROM reservations WHERE date = $1 AND status = 'confirmed'", [today]),
      db.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")
    ])

    const stats = {
      employees: parseInt(statsQuery[0].rows[0].count),
      carBookings: parseInt(statsQuery[1].rows[0].count),
      meetings: parseInt(statsQuery[2].rows[0].count),
      pendingLeave: parseInt(statsQuery[3].rows[0].count)
    }

    // 2. Recent Activities (Limit 5 of each, then sort in JS)
    const [leaveActivity, carActivity, meetingActivity] = await Promise.all([
      db.query(`
        SELECT 'leave' as type, l.id, e.first_name || ' ' || e.last_name as user_name,
        t.name as action_detail, l.created_at, l.status
        FROM leave_requests l
        JOIN employees e ON l.employee_id = e.id
        JOIN leave_types t ON l.leave_type_id = t.id
        ORDER BY l.created_at DESC LIMIT 5
      `),
      db.query(`
        SELECT 'car' as type, b.id, e.first_name || ' ' || e.last_name as user_name,
        c.license_plate as action_detail, b.created_at, b.status
        FROM car_bookings b
        JOIN employees e ON b.employee_id = e.id
        JOIN cars c ON b.car_id = c.id
        ORDER BY b.created_at DESC LIMIT 5
      `),
      db.query(`
        SELECT 'meeting' as type, r.id, e.first_name || ' ' || e.last_name as user_name,
        m.name as action_detail, r.created_at, r.status
        FROM reservations r
        JOIN employees e ON r.booked_by = e.id
        JOIN meeting_rooms m ON r.room_id = m.id
        ORDER BY r.created_at DESC LIMIT 5
      `)
    ])

    const allActivities = [
      ...leaveActivity.rows.map(r => ({ ...r, action: `ขอลา${r.action_detail}` })),
      ...carActivity.rows.map(r => ({ ...r, action: `จองรถ ${r.action_detail}` })),
      ...meetingActivity.rows.map(r => ({ ...r, action: `จอง${r.action_detail}` }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)

    // 3. Upcoming Events (Today)
    const eventsQuery = await db.query(`
      SELECT r.id, r.title, r.start_time, r.end_time, m.name as room_name, r.attendees_count
      FROM reservations r
      JOIN meeting_rooms m ON r.room_id = m.id
      WHERE r.date = $1 AND r.status = 'confirmed'
      ORDER BY r.start_time ASC
    `, [today])

    const upcomingEvents = eventsQuery.rows.map(r => ({
      id: r.id,
      title: r.title,
      time: `${r.start_time.substring(0, 5)} - ${r.end_time.substring(0, 5)}`,
      room: r.room_name,
      attendees: r.attendees_count
    }))

    // 4. Car Alerts
    const alertsQuery = await db.query(`
      SELECT license_plate as car, 
      CASE 
        WHEN insurance_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'insurance'
        WHEN tax_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'tax'
      END as type,
      CASE 
        WHEN insurance_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'ประกันภัยจะหมดอายุใน ' || (insurance_expiry - CURRENT_DATE) || ' วัน'
        WHEN tax_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'ภาษีรถจะหมดอายุใน ' || (tax_expiry - CURRENT_DATE) || ' วัน'
      END as message
      FROM cars
      WHERE (insurance_expiry <= CURRENT_DATE + INTERVAL '30 days' AND insurance_expiry >= CURRENT_DATE)
      OR (tax_expiry <= CURRENT_DATE + INTERVAL '30 days' AND tax_expiry >= CURRENT_DATE)
      LIMIT 5
    `)
    
    // Map alerts to frontend format
    const alerts = alertsQuery.rows.map((r, i) => ({
      id: i + 1,
      car: r.car,
      type: r.type,
      message: r.message,
      level: 'warning'
    }))

    res.json({
      stats,
      activities: allActivities,
      upcomingEvents,
      alerts
    })

  } catch (error) {
    console.error('Dashboard Error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

export default router
