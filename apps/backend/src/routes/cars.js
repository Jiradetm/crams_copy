import express from 'express'
import db from '../db/index.js'
import { authenticateToken, requireRole } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/cars
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, e.first_name || ' ' || e.last_name as assigned_to
      FROM cars c
      LEFT JOIN employees e ON c.assigned_employee_id = e.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.license_plate
    `)
    res.json({ data: result.rows.map(c => ({
      id: c.id,
      licensePlate: c.license_plate,
      brand: c.brand,
      model: c.model,
      year: c.year,
      color: c.color,
      usageType: c.usage_type,
      status: c.status,
      assignedTo: c.assigned_to,
      currentMileage: c.current_mileage,
      fuelLevel: c.fuel_level,
      insuranceExpiry: c.insurance_expiry,
      taxExpiry: c.tax_expiry,
      lastOilChangeMileage: c.last_oil_change_mileage
    })) })
  } catch (error) {
    console.error('Get cars error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// GET /api/cars/alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = []
    const today = new Date()
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Insurance expiry alerts
    const insuranceResult = await db.query(`
      SELECT id, license_plate, insurance_expiry FROM cars 
      WHERE deleted_at IS NULL AND insurance_expiry <= $1
    `, [in30Days])

    for (const car of insuranceResult.rows) {
      const daysLeft = Math.ceil((new Date(car.insurance_expiry) - today) / (1000 * 60 * 60 * 24))
      alerts.push({
        carId: car.id,
        licensePlate: car.license_plate,
        type: 'insurance',
        level: daysLeft <= 7 ? 'danger' : 'warning',
        message: `ประกันภัยหมดอายุใน ${daysLeft} วัน`,
        expiryDate: car.insurance_expiry
      })
    }

    // Tax expiry alerts
    const taxResult = await db.query(`
      SELECT id, license_plate, tax_expiry FROM cars 
      WHERE deleted_at IS NULL AND tax_expiry <= $1
    `, [in30Days])

    for (const car of taxResult.rows) {
      const daysLeft = Math.ceil((new Date(car.tax_expiry) - today) / (1000 * 60 * 60 * 24))
      alerts.push({
        carId: car.id,
        licensePlate: car.license_plate,
        type: 'tax',
        level: daysLeft <= 7 ? 'danger' : 'warning',
        message: `ภาษีรถหมดอายุใน ${daysLeft} วัน`,
        expiryDate: car.tax_expiry
      })
    }

    // Oil change alerts (every 10,000 km)
    const oilResult = await db.query(`
      SELECT id, license_plate, current_mileage, last_oil_change_mileage FROM cars 
      WHERE deleted_at IS NULL AND current_mileage - COALESCE(last_oil_change_mileage, 0) >= 9000
    `)

    for (const car of oilResult.rows) {
      const kmSinceChange = car.current_mileage - (car.last_oil_change_mileage || 0)
      alerts.push({
        carId: car.id,
        licensePlate: car.license_plate,
        type: 'oil_change',
        level: kmSinceChange >= 10000 ? 'danger' : 'warning',
        message: `ควรเปลี่ยนน้ำมันเครื่อง (${kmSinceChange.toLocaleString()} km)`
      })
    }

    res.json({ data: alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/cars
router.post('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { licensePlate, brand, model, year, color, usageType, insuranceExpiry, taxExpiry } = req.body
    const result = await db.query(`
      INSERT INTO cars (license_plate, brand, model, year, color, usage_type, insurance_expiry, tax_expiry)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [licensePlate, brand, model, year, color, usageType, insuranceExpiry, taxExpiry])
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'ทะเบียนรถซ้ำ' })
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// PUT /api/cars/:id
router.put('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { status, currentMileage, fuelLevel, insuranceExpiry, taxExpiry, lastOilChangeMileage } = req.body
    await db.query(`
      UPDATE cars SET 
        status = COALESCE($1, status),
        current_mileage = COALESCE($2, current_mileage),
        fuel_level = COALESCE($3, fuel_level),
        insurance_expiry = COALESCE($4, insurance_expiry),
        tax_expiry = COALESCE($5, tax_expiry),
        last_oil_change_mileage = COALESCE($6, last_oil_change_mileage),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [status, currentMileage, fuelLevel, insuranceExpiry, taxExpiry, lastOilChangeMileage, id])
    res.json({ message: 'อัพเดทสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/cars/:id
router.delete('/:id', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE cars SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id])
    res.json({ message: 'ลบรถสำเร็จ' })
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

export default router
