import express from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/users - Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.system_role, u.is_active, u.last_login, u.created_at,
             e.id as emp_id, e.employee_code, e.first_name, e.last_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `)

    // Get roles for each user
    const users = await Promise.all(result.rows.map(async (user) => {
      const rolesResult = await db.query(`
        SELECT r.code FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
      `, [user.id])

      return {
        id: user.id,
        email: user.email,
        systemRole: user.system_role,
        moduleRoles: rolesResult.rows.map(r => r.code),
        isActive: user.is_active,
        lastLogin: user.last_login,
        employee: user.emp_id ? {
          id: user.emp_id,
          employeeCode: user.employee_code,
          firstName: user.first_name,
          lastName: user.last_name
        } : null
      }
    }))

    res.json({ data: users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      SELECT u.*, e.id as emp_id, e.employee_code, e.first_name, e.last_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    }

    const user = result.rows[0]
    const rolesResult = await db.query(`
      SELECT r.code FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [id])

    res.json({
      id: user.id,
      email: user.email,
      systemRole: user.system_role,
      moduleRoles: rolesResult.rows.map(r => r.code),
      isActive: user.is_active,
      employee: user.emp_id ? {
        id: user.emp_id,
        employeeCode: user.employee_code,
        firstName: user.first_name,
        lastName: user.last_name
      } : null
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
  }
})

// POST /api/users - Create new user
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { email, password, employeeId, systemRole = 'User', moduleRoles = [] } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const result = await db.query(`
      INSERT INTO users (email, password_hash, employee_id, system_role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, system_role, is_active, created_at
    `, [email, passwordHash, employeeId || null, systemRole])

    const newUser = result.rows[0]

    // Add module roles
    if (moduleRoles.length > 0) {
      for (const roleCode of moduleRoles) {
        const roleResult = await db.query('SELECT id FROM roles WHERE code = $1', [roleCode])
        if (roleResult.rows.length > 0) {
          await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', 
            [newUser.id, roleResult.rows[0].id])
        }
      }
    }

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      systemRole: newUser.system_role,
      moduleRoles,
      isActive: newUser.is_active
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { email, password, systemRole, moduleRoles, isActive } = req.body

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    }

    // Build update query
    let updates = []
    let values = []
    let paramIndex = 1

    if (email) {
      updates.push(`email = $${paramIndex++}`)
      values.push(email)
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updates.push(`password_hash = $${paramIndex++}`)
      values.push(passwordHash)
    }
    if (systemRole) {
      updates.push(`system_role = $${paramIndex++}`)
      values.push(systemRole)
    }
    if (typeof isActive === 'boolean') {
      updates.push(`is_active = $${paramIndex++}`)
      values.push(isActive)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    await db.query(`
      UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
    `, values)

    // Update module roles if provided
    if (moduleRoles) {
      await db.query('DELETE FROM user_roles WHERE user_id = $1', [id])
      for (const roleCode of moduleRoles) {
        const roleResult = await db.query('SELECT id FROM roles WHERE code = $1', [roleCode])
        if (roleResult.rows.length > 0) {
          await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', 
            [id, roleResult.rows[0].id])
        }
      }
    }

    res.json({ message: 'อัพเดทผู้ใช้สำเร็จ' })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพเดท' })
  }
})

// DELETE /api/users/:id - Soft delete user
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(`
      UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    }

    res.json({ message: 'ลบผู้ใช้สำเร็จ' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ' })
  }
})

export default router
