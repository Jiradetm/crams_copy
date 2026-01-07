import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/leave-types
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_types WHERE is_active = true ORDER BY name')
    res.json({ data: result.rows.map(t => ({
      id: t.id,
      code: t.code,
      name: t.name,
      nameEn: t.name_en,
      maxDaysPerYear: t.max_days_per_year,
      requiresDocument: t.requires_document,
      minDaysNotice: t.min_days_notice,
      allowBackdateDays: t.allow_backdate_days
    })) })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/leave-types
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { code, name, nameEn, maxDaysPerYear, requiresDocument, minDaysNotice, allowBackdateDays } = req.body
    const result = await db.query(`
      INSERT INTO leave_types (code, name, name_en, max_days_per_year, requires_document, min_days_notice, allow_backdate_days)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [code, name, nameEn, maxDaysPerYear, requiresDocument || false, minDaysNotice || 0, allowBackdateDays || 0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'รหัสประเภทการลาซ้ำ' })
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
