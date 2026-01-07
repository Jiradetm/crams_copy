import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/departments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY name
    `)
    res.json({ data: result.rows.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      nameEn: d.name_en,
      isActive: d.is_active
    })) })
  } catch (error) {
    console.error('Get departments error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/departments
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { code, name, nameEn } = req.body
    if (!code || !name) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็น' })
    }
    const result = await db.query(`
      INSERT INTO departments (code, name, name_en) VALUES ($1, $2, $3) RETURNING *
    `, [code, name, nameEn])
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'รหัสแผนกซ้ำ' })
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PUT /api/departments/:id
router.put('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, nameEn } = req.body
    await db.query(`UPDATE departments SET name = $1, name_en = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`, 
      [name, nameEn, id])
    res.json({ message: 'อัพเดทสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/departments/:id
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE departments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id])
    res.json({ message: 'ลบแผนกสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
