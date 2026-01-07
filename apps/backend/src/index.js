import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import db from './db/index.js'
import { seedDatabase } from './db/seed.js'

// Import routes
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import employeesRoutes from './routes/employees.js'
import departmentsRoutes from './routes/departments.js'
import rolesRoutes from './routes/roles.js'
import carsRoutes from './routes/cars.js'
import carBookingsRoutes from './routes/carBookings.js'
import meetingRoomsRoutes from './routes/meetingRooms.js'
import reservationsRoutes from './routes/reservations.js'
import leaveTypesRoutes from './routes/leaveTypes.js'
import leaveRequestsRoutes from './routes/leaveRequests.js'
import dashboardRoutes from './routes/dashboard.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message })
  }
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/employees', employeesRoutes)
app.use('/api/departments', departmentsRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/cars', carsRoutes)
app.use('/api/car-bookings', carBookingsRoutes)
app.use('/api/meeting-rooms', meetingRoomsRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/leave-types', leaveTypesRoutes)
app.use('/api/leave-requests', leaveRequestsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'ไม่พบ API ที่ต้องการ' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' })
})

// Start server
app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    CARMS API Server                        ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}               ║
║  📦 Environment: ${process.env.NODE_ENV || 'development'}                               ║
║  🐘 Database: PostgreSQL                                   ║
╚════════════════════════════════════════════════════════════╝
  `)
  
  // Seed database with initial data
  await seedDatabase()
})
