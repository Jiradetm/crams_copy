import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/car-bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, c.license_plate, c.brand, c.model,
             e.first_name || ' ' || e.last_name as employee_name,
             a.first_name || ' ' || a.last_name as approver_name
      FROM car_bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN employees e ON b.employee_id = e.id
      LEFT JOIN employees a ON b.approved_by = a.id
      ORDER BY b.created_at DESC
    `)
    res.json({ data: result.rows.map(b => ({
      id: b.id,
      car: { id: b.car_id, licensePlate: b.license_plate, brand: b.brand, model: b.model },
      employee: { id: b.employee_id, name: b.employee_name },
      purpose: b.purpose,
      destination: b.destination,
      startDate: b.start_date,
      endDate: b.end_date,
      status: b.status,
      approvedBy: b.approver_name,
      startMileage: b.start_mileage,
      endMileage: b.end_mileage,
      notes: b.notes
    })) })
  } catch (error) {
    console.error('Get car bookings error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/car-bookings
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { carId, purpose, destination, startDate, endDate } = req.body
    
    // Check car availability
    const conflictResult = await db.query(`
      SELECT id FROM car_bookings 
      WHERE car_id = $1 AND status IN ('pending', 'approved', 'in-use')
      AND NOT (end_date < $2 OR start_date > $3)
    `, [carId, startDate, endDate])

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'รถถูกจองในช่วงเวลานี้แล้ว' })
    }

    // Get employee ID from user
    const userResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const employeeId = userResult.rows[0]?.employee_id

    if (!employeeId) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลพนักงาน' })
    }

    const result = await db.query(`
      INSERT INTO car_bookings (car_id, employee_id, purpose, destination, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [carId, employeeId, purpose, destination, startDate, endDate])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PATCH /api/car-bookings/:id/status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, startMileage, endMileage, notes } = req.body

    // Get current booking
    const bookingResult = await db.query('SELECT * FROM car_bookings WHERE id = $1', [id])
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบการจอง' })
    }

    const booking = bookingResult.rows[0]
    const userResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const employeeId = userResult.rows[0]?.employee_id

    // Update based on status
    if (status === 'approved' || status === 'rejected') {
      await db.query(`
        UPDATE car_bookings SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3
      `, [status, employeeId, id])

      if (status === 'approved') {
        await db.query("UPDATE cars SET status = 'in-use' WHERE id = $1", [booking.car_id])
      }
    } else if (status === 'in-use') {
      await db.query(`
        UPDATE car_bookings SET status = 'in-use', start_mileage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      `, [startMileage, id])
    } else if (status === 'completed') {
      await db.query(`
        UPDATE car_bookings SET status = 'completed', end_mileage = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3
      `, [endMileage, notes, id])

      // Update car mileage and status
      await db.query("UPDATE cars SET current_mileage = $1, status = 'available' WHERE id = $2", 
        [endMileage, booking.car_id])
    } else if (status === 'cancelled') {
      await db.query("UPDATE car_bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id])
    }

    res.json({ message: 'อัพเดทสถานะสำเร็จ' })
  } catch (error) {
    console.error('Update booking status error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
