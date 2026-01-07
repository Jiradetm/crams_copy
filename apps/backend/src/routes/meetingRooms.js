import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/meeting-rooms
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM meeting_rooms WHERE deleted_at IS NULL ORDER BY name
    `)
    res.json({ data: result.rows.map(r => ({
      id: r.id,
      name: r.name,
      nameEn: r.name_en,
      building: r.building,
      floor: r.floor,
      capacity: r.capacity,
      facilities: r.facilities,
      isActive: r.is_active
    })) })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/meeting-rooms
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { name, nameEn, building, floor, capacity, facilities } = req.body
    const result = await db.query(`
      INSERT INTO meeting_rooms (name, name_en, building, floor, capacity, facilities)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [name, nameEn, building, floor, capacity, facilities])
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PUT /api/meeting-rooms/:id
router.put('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, capacity, facilities } = req.body
    await db.query(`
      UPDATE meeting_rooms SET name = COALESCE($1, name), capacity = COALESCE($2, capacity),
      facilities = COALESCE($3, facilities), updated_at = CURRENT_TIMESTAMP WHERE id = $4
    `, [name, capacity, facilities, id])
    res.json({ message: 'อัพเดทสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/meeting-rooms/:id
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE meeting_rooms SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id])
    res.json({ message: 'ลบห้องประชุมสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
