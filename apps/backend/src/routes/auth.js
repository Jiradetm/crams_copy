import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db/index.js'

const router = express.Router()

// Track login attempts in memory (could use Redis in production)
const loginAttempts = new Map()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    // Check login attempts
    const attempts = loginAttempts.get(email) || { count: 0, lockedUntil: null }
    
    if (attempts.lockedUntil && new Date() < new Date(attempts.lockedUntil)) {
      const remainingMinutes = Math.ceil((new Date(attempts.lockedUntil) - new Date()) / 60000)
      return res.status(423).json({ 
        error: `บัญชีถูกล็อก กรุณารอ ${remainingMinutes} นาที`,
        lockedUntil: attempts.lockedUntil 
      })
    }

    // Find user with employee info
    const userResult = await db.query(`
      SELECT u.*, e.id as emp_id, e.employee_code, e.first_name, e.last_name, 
             e.first_name_en, e.last_name_en, e.email as emp_email,
             d.name as department_name, p.name as position_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `, [email])

    const user = userResult.rows[0]

    if (!user) {
      // Increment failed attempts
      attempts.count++
      if (attempts.count >= 5) {
        attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
      loginAttempts.set(email, attempts)
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      attempts.count++
      if (attempts.count >= 5) {
        attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
      }
      loginAttempts.set(email, attempts)
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'บัญชีนี้ถูกระงับการใช้งาน' })
    }

    // Clear login attempts on success
    loginAttempts.delete(email)

    // Get user roles
    const rolesResult = await db.query(`
      SELECT r.code FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [user.id])
    const moduleRoles = rolesResult.rows.map(r => r.code)

    // Update last login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.system_role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    // Build response
    const responseUser = {
      id: user.id,
      email: user.email,
      systemRole: user.system_role,
      moduleRoles,
      employee: user.emp_id ? {
        id: user.emp_id,
        employeeCode: user.employee_code,
        firstName: user.first_name,
        lastName: user.last_name,
        firstNameEn: user.first_name_en,
        lastNameEn: user.last_name_en,
        department: user.department_name,
        position: user.position_name
      } : null
    }

    res.json({ token, user: responseUser })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'ออกจากระบบสำเร็จ' })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'ไม่พบ Token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user with employee info
    const userResult = await db.query(`
      SELECT u.*, e.id as emp_id, e.employee_code, e.first_name, e.last_name,
             e.first_name_en, e.last_name_en,
             d.name as department_name, p.name as position_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `, [decoded.userId])

    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    }

    // Get roles
    const rolesResult = await db.query(`
      SELECT r.code FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [user.id])
    const moduleRoles = rolesResult.rows.map(r => r.code)

    res.json({
      id: user.id,
      email: user.email,
      systemRole: user.system_role,
      moduleRoles,
      employee: user.emp_id ? {
        id: user.emp_id,
        employeeCode: user.employee_code,
        firstName: user.first_name,
        lastName: user.last_name,
        firstNameEn: user.first_name_en,
        lastNameEn: user.last_name_en,
        department: user.department_name,
        position: user.position_name
      } : null
    })
  } catch (error) {
    console.error('Auth/me error:', error)
    res.status(401).json({ error: 'Token ไม่ถูกต้อง' })
  }
})

export default router
