import { testConnection, getStatistics } from '@/lib/database'
import { validateEnvironment } from '@/lib/utils'

// Test koneksi database dan environment setup
export async function runDatabaseTests() {
  console.log('🔍 Testing Database Connection...')
  
  try {
    // Test 1: Validasi environment variables
    console.log('1. Validating environment variables...')
    validateEnvironment()
    console.log('✅ Environment variables are valid')
    
    // Test 2: Test koneksi database
    console.log('2. Testing database connection...')
    const connectionResult = await testConnection()
    
    if (connectionResult.connected) {
      console.log('✅ Database connection successful')
    } else {
      console.log('❌ Database connection failed:', connectionResult.error)
      return false
    }
    
    // Test 3: Test basic query
    console.log('3. Testing basic database query...')
    const statsResult = await getStatistics()
    
    if (statsResult.error) {
      console.log('❌ Database query failed:', statsResult.error)
      return false
    }
    
    console.log('✅ Database query successful')
    console.log('📊 Current statistics:', statsResult.data)
    
    console.log('🎉 All database tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

// Helper untuk development - menjalankan test saat aplikasi dimuat
export async function initializeDatabase() {
  if (process.env.NODE_ENV === 'development') {
    const testResult = await runDatabaseTests()
    
    if (!testResult) {
      console.error('⚠️  Database setup incomplete. Please check:')
      console.error('   1. Supabase project is created and active')
      console.error('   2. Environment variables are configured in .env.local')
      console.error('   3. Database tables are created using create_tables.sql')
      console.error('   4. Internet connection is stable')
    }
    
    return testResult
  }
  
  return true
}
