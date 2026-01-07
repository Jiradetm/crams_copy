import pkg from 'pg'
const { Pool } = pkg

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://carms_admin:carms_password_2026@localhost:5432/carms_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
})

// Helper function for queries
const query = async (text, params) => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (duration > 100) {
      console.log('Slow query', { text: text.substring(0, 50), duration, rows: result.rowCount })
    }
    return result
  } catch (error) {
    console.error('Query error:', error.message)
    throw error
  }
}

// Get a client for transactions
const getClient = async () => {
  const client = await pool.connect()
  const originalQuery = client.query.bind(client)
  const originalRelease = client.release.bind(client)

  // Set a timeout of 5 seconds, after which we will log and release
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)

  client.query = (...args) => originalQuery(...args)
  client.release = () => {
    clearTimeout(timeout)
    return originalRelease()
  }

  return client
}

export default {
  query,
  getClient,
  pool
}
