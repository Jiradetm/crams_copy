import bcrypt from 'bcryptjs'
import db from './index.js'

export const seedDatabase = async () => {
  try {
    console.log('🌱 Checking database seed data...')

    // Check if admin user exists
    const userCheck = await db.query("SELECT id FROM users WHERE email = 'admin@carms.co.th'")
    
    if (userCheck.rows.length > 0) {
      console.log('✅ Seed data already exists')
      return
    }

    console.log('🌱 Seeding database with initial data...')

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10)
    console.log('Password hash generated for admin123')

    // Insert employees if not exist
    await db.query(`
      INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
      SELECT 'EMP001', 'สมชาย', 'ใจดี', 'Somchai', 'Jaidee', 'admin@carms.co.th', '081-111-1111', d.id, p.id
      FROM departments d, positions p WHERE d.code = 'IT' AND p.code = 'MGR'
      ON CONFLICT (employee_code) DO NOTHING
    `)

    await db.query(`
      INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
      SELECT 'EMP002', 'สมหญิง', 'รักงาน', 'Somying', 'Rakngarn', 'hr@carms.co.th', '081-222-2222', d.id, p.id
      FROM departments d, positions p WHERE d.code = 'HR' AND p.code = 'MGR'
      ON CONFLICT (employee_code) DO NOTHING
    `)

    await db.query(`
      INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
      SELECT 'EMP003', 'วิชัย', 'เก่งมาก', 'Wichai', 'Kengmak', 'user@carms.co.th', '081-333-3333', d.id, p.id
      FROM departments d, positions p WHERE d.code = 'IT' AND p.code = 'JR'
      ON CONFLICT (employee_code) DO NOTHING
    `)

    // Insert users with proper hashed password
    await db.query(`
      INSERT INTO users (email, password_hash, employee_id, system_role, is_active)
      SELECT 'admin@carms.co.th', $1, e.id, 'Admin', true
      FROM employees e WHERE e.employee_code = 'EMP001'
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash])

    await db.query(`
      INSERT INTO users (email, password_hash, employee_id, system_role, is_active)
      SELECT 'hr@carms.co.th', $1, e.id, 'User', true
      FROM employees e WHERE e.employee_code = 'EMP002'
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash])

    await db.query(`
      INSERT INTO users (email, password_hash, employee_id, system_role, is_active)
      SELECT 'user@carms.co.th', $1, e.id, 'User', true
      FROM employees e WHERE e.employee_code = 'EMP003'
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash])

    // Add roles to admin user
    await db.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@carms.co.th' AND r.code = 'ADMIN'
      ON CONFLICT DO NOTHING
    `)

    // Add leave quotas
    const currentYear = new Date().getFullYear()
    await db.query(`
      INSERT INTO leave_quotas (employee_id, leave_type_id, year, total_days, used_days)
      SELECT e.id, lt.id, $1, lt.max_days_per_year, 0
      FROM employees e, leave_types lt
      WHERE e.employee_code IN ('EMP001', 'EMP002', 'EMP003')
      ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING
    `, [currentYear])

    console.log('✅ Database seeded successfully!')
    console.log('📧 Login: admin@carms.co.th / hr@carms.co.th / user@carms.co.th')
    console.log('🔑 Password: admin123')

  } catch (error) {
    console.error('❌ Seed error:', error.message)
  }
}
