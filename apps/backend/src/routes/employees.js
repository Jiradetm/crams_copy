import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/employees - Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.*, d.name as department_name, d.code as department_code,
             p.name as position_name, p.code as position_code
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.deleted_at IS NULL
      ORDER BY e.employee_code
    `)

    const employees = result.rows.map(e => ({
      id: e.id,
      employeeCode: e.employee_code,
      firstName: e.first_name,
      lastName: e.last_name,
      firstNameEn: e.first_name_en,
      lastNameEn: e.last_name_en,
      email: e.email,
      phone: e.phone,
      hireDate: e.hire_date,
      isActive: e.is_active,
      department: e.department_id ? {
        id: e.department_id,
        name: e.department_name,
        code: e.department_code
      } : null,
      position: e.position_id ? {
        id: e.position_id,
        name: e.position_name,
        code: e.position_code
      } : null
    }))

    res.json({ data: employees })
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
})

// GET /api/employees/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(`
      SELECT e.*, d.name as department_name, p.name as position_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1 AND e.deleted_at IS NULL
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบพนักงาน' })
    }

    const e = result.rows[0]
    res.json({
      id: e.id,
      employeeCode: e.employee_code,
      firstName: e.first_name,
      lastName: e.last_name,
      email: e.email,
      phone: e.phone,
      department: { id: e.department_id, name: e.department_name },
      position: { id: e.position_id, name: e.position_name }
    })
  } catch (error) {
    console.error('Get employee error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/employees
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { employeeCode, firstName, lastName, firstNameEn, lastNameEn, email, phone, departmentId, positionId, hireDate } = req.body

    if (!employeeCode || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็น' })
    }

    const result = await db.query(`
      INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id, hire_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [employeeCode, firstName, lastName, firstNameEn, lastNameEn, email, phone, departmentId, positionId, hireDate])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create employee error:', error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'รหัสพนักงานหรืออีเมลซ้ำ' })
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PUT /api/employees/:id
router.put('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, phone, departmentId, positionId } = req.body

    await db.query(`
      UPDATE employees 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          department_id = COALESCE($5, department_id),
          position_id = COALESCE($6, position_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [firstName, lastName, email, phone, departmentId, positionId, id])

    res.json({ message: 'อัพเดทสำเร็จ' })
  } catch (error) {
    console.error('Update employee error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/employees/:id
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id])
    res.json({ message: 'ลบพนักงานสำเร็จ' })
  } catch (error) {
    console.error('Delete employee error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
