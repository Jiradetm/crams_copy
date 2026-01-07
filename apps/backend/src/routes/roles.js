import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/roles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM roles ORDER BY type, name')
    res.json({ data: result.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      type: r.type,
      description: r.description,
      isActive: r.is_active
    })) })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/roles
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { code, name, type = 'module', description } = req.body
    const result = await db.query(`
      INSERT INTO roles (code, name, type, description) VALUES ($1, $2, $3, $4) RETURNING *
    `, [code, name, type, description])
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'รหัสบทบาทซ้ำ' })
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
