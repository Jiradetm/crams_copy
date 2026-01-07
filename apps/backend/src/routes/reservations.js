import express from 'express'
import db from '../db/index.js'
import { authenticateToken } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/reservations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, m.name as room_name, e.first_name || ' ' || e.last_name as booked_by_name
      FROM reservations r
      JOIN meeting_rooms m ON r.room_id = m.id
      JOIN employees e ON r.booked_by = e.id
      ORDER BY r.date DESC, r.start_time
    `)
    res.json({ data: result.rows.map(r => ({
      id: r.id,
      room: { id: r.room_id, name: r.room_name },
      title: r.title,
      description: r.description,
      bookedBy: r.booked_by_name,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      attendeesCount: r.attendees_count,
      status: r.status
    })) })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// GET /api/reservations/calendar
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const result = await db.query(`
      SELECT r.*, m.name as room_name, e.first_name || ' ' || e.last_name as booked_by_name
      FROM reservations r
      JOIN meeting_rooms m ON r.room_id = m.id
      JOIN employees e ON r.booked_by = e.id
      WHERE r.date >= $1 AND r.date <= $2 AND r.status = 'confirmed'
      ORDER BY r.date, r.start_time
    `, [startDate, endDate])

    res.json({ data: result.rows.map(r => ({
      id: r.id,
      roomId: r.room_id,
      room: r.room_name,
      title: r.title,
      date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date.toISOString().split('T')[0],
      startTime: r.start_time,
      endTime: r.end_time,
      bookedBy: r.booked_by_name,
      status: r.status
    })) })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/reservations
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomId, title, description, date, startTime, endTime, attendeesCount } = req.body

    // Validate date not in past
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    if (date < todayStr) {
      return res.status(400).json({ error: 'ไม่สามารถจองย้อนหลังได้' })
    }

    // Check for overlapping reservations
    const conflictResult = await db.query(`
      SELECT id FROM reservations 
      WHERE room_id = $1 AND date = $2 AND status = 'confirmed'
      AND NOT (end_time <= $3 OR start_time >= $4)
    `, [roomId, date, startTime, endTime])

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'ห้องประชุมถูกจองในช่วงเวลานี้แล้ว' })
    }

    // Get employee ID
    const userResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const employeeId = userResult.rows[0]?.employee_id

    const result = await db.query(`
      INSERT INTO reservations (room_id, title, description, booked_by, date, start_time, end_time, attendees_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [roomId, title, description, employeeId, date, startTime, endTime, attendeesCount])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create reservation error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/reservations/:id (Cancel)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    await db.query("UPDATE reservations SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id])
    res.json({ message: 'ยกเลิกการจองสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
