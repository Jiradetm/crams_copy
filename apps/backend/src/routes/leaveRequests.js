import express from 'express'
import db from '../db/index.js'
import { authenticateToken } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/leave-requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT lr.*, lt.name as leave_type_name, lt.code as leave_type_code,
             e.first_name || ' ' || e.last_name as employee_name,
             a.first_name || ' ' || a.last_name as approver_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees a ON lr.approved_by = a.id
      ORDER BY lr.created_at DESC
    `)
    res.json({ data: result.rows.map(r => ({
      id: r.id,
      leaveType: { id: r.leave_type_id, name: r.leave_type_name, code: r.leave_type_code },
      employee: { id: r.employee_id, name: r.employee_name },
      startDate: r.start_date,
      endDate: r.end_date,
      days: parseFloat(r.days),
      reason: r.reason,
      status: r.status,
      approvedBy: r.approver_name,
      approvedAt: r.approved_at,
      rejectionReason: r.rejection_reason
    })) })
  } catch (error) {
    console.error('Get leave requests error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// GET /api/leave-requests/all-quotas
router.get('/all-quotas', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    const userResult = await db.query('SELECT system_role FROM users WHERE id = $1', [req.user.userId])
    if (userResult.rows[0]?.system_role !== 'Admin') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' })
    }

    const currentYear = new Date().getFullYear()
    const result = await db.query(`
      SELECT lq.*, lt.name as leave_type_name, e.first_name, e.last_name, e.employee_code
      FROM leave_quotas lq
      JOIN leave_types lt ON lq.leave_type_id = lt.id
      JOIN employees e ON lq.employee_id = e.id
      WHERE lq.year = $1
      ORDER BY e.employee_code, lt.id
    `, [currentYear])

    // Group by employee
    const employeesMap = new Map()
    
    result.rows.forEach(row => {
      if (!employeesMap.has(row.employee_id)) {
        employeesMap.set(row.employee_id, {
          id: row.employee_id,
          code: row.employee_code,
          name: `${row.first_name} ${row.last_name}`,
          quotas: []
        })
      }
      employeesMap.get(row.employee_id).quotas.push({
        leaveTypeId: row.leave_type_id,
        leaveType: row.leave_type_name,
        total: parseFloat(row.total_days),
        used: parseFloat(row.used_days),
        remaining: parseFloat(row.total_days) - parseFloat(row.used_days)
      })
    })

    res.json({ year: currentYear, data: Array.from(employeesMap.values()) })
  } catch (error) {
    console.error('Get all quotas error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// GET /api/leave-requests/my-quota
router.get('/my-quota', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const employeeId = userResult.rows[0]?.employee_id

    if (!employeeId) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลพนักงาน' })
    }

    const currentYear = new Date().getFullYear()
    const result = await db.query(`
      SELECT lq.*, lt.name as leave_type_name
      FROM leave_quotas lq
      JOIN leave_types lt ON lq.leave_type_id = lt.id
      WHERE lq.employee_id = $1 AND lq.year = $2
    `, [employeeId, currentYear])

    const quotas = result.rows.map(q => ({
      leaveTypeId: q.leave_type_id,
      leaveType: q.leave_type_name,
      total: parseFloat(q.total_days),
      used: parseFloat(q.used_days),
      remaining: parseFloat(q.total_days) - parseFloat(q.used_days)
    }))

    res.json({ year: currentYear, quotas })
  } catch (error) {
    console.error('Get quota error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/leave-requests
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { leaveTypeId, startDate, endDate, days, reason, attachmentUrl } = req.body

    const userResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const employeeId = userResult.rows[0]?.employee_id

    if (!employeeId) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลพนักงาน' })
    }

    // Check remaining quota
    const currentYear = new Date().getFullYear()
    const quotaResult = await db.query(`
      SELECT total_days, used_days FROM leave_quotas 
      WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3
    `, [employeeId, leaveTypeId, currentYear])

    if (quotaResult.rows.length > 0) {
      const remaining = parseFloat(quotaResult.rows[0].total_days) - parseFloat(quotaResult.rows[0].used_days)
      if (days > remaining) {
        return res.status(400).json({ error: `วันลาไม่เพียงพอ (เหลือ ${remaining} วัน)` })
      }
    }

    const result = await db.query(`
      INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, days, reason, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [employeeId, leaveTypeId, startDate, endDate, days, reason, attachmentUrl])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create leave request error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PATCH /api/leave-requests/:id/status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const client = await db.getClient()
  try {
    const { id } = req.params
    const { status, rejectionReason } = req.body

    await client.query('BEGIN')

    // Get leave request
    const requestResult = await client.query('SELECT * FROM leave_requests WHERE id = $1', [id])
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'ไม่พบคำขอลา' })
    }

    const leaveRequest = requestResult.rows[0]

    // Get approver employee ID
    const userResult = await client.query('SELECT employee_id FROM users WHERE id = $1', [req.user.userId])
    const approverId = userResult.rows[0]?.employee_id

    // Update status
    await client.query(`
      UPDATE leave_requests 
      SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, rejection_reason = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [status, approverId, rejectionReason || null, id])

    // If approved, update quota
    if (status === 'approved') {
      const currentYear = new Date().getFullYear()
      await client.query(`
        UPDATE leave_quotas 
        SET used_days = used_days + $1, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4
      `, [leaveRequest.days, leaveRequest.employee_id, leaveRequest.leave_type_id, currentYear])
    }

    await client.query('COMMIT')
    res.json({ message: 'อัพเดทสถานะสำเร็จ' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Update leave status error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  } finally {
    client.release()
  }
})

// DELETE /api/leave-requests/:id (Cancel)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    await db.query("UPDATE leave_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id])
    res.json({ message: 'ยกเลิกคำขอลาสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
