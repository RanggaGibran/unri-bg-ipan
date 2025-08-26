// Utility untuk environment variables dan konfigurasi
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
}

// Validasi environment variables
export function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and make sure all required variables are set.'
    )
  }

  return true
}

// Utility untuk formatting
export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateInput(date: string | null): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// Utility untuk validasi NIM
export function validateNIM(nim: string): boolean {
  // Validasi format NIM (contoh: 2021001)
  const nimRegex = /^\d{4}\d{3}$/
  return nimRegex.test(nim)
}

// Utility untuk progress calculation
export function calculateProgress(student: any): number {
  let completed = 0
  let total = 4 // UJ3, SUP, SHP, UK

  if (student.uj3_date) completed++
  if (student.sup_date) completed++
  if (student.shp_date) completed++
  if (student.uk_date) completed++

  return Math.round((completed / total) * 100)
}

// Utility untuk mendapatkan status mahasiswa
export function getStudentStatus(student: any): {
  status: string
  color: string
  progress: number
} {
  const progress = calculateProgress(student)
  
  if (student.is_completed) {
    return {
      status: 'Kompre',
      color: 'green',
      progress: 100
    }
  }
  
  if (progress === 0) {
    return {
      status: 'Belum Mulai',
      color: 'gray',
      progress: 0
    }
  }
  
  if (progress === 100) {
    return {
      status: 'Siap Kompre',
      color: 'blue',
      progress: 100
    }
  }
  
  return {
    status: 'Dalam Progress',
    color: 'yellow',
    progress
  }
}

// Utility untuk mendapatkan tahapan selanjutnya
export function getNextStage(student: any): string {
  if (!student.uj3_date) return 'UJ3'
  if (!student.sup_date) return 'SUP'
  if (!student.shp_date) return 'SHP'
  if (!student.uk_date) return 'UK'
  return 'Kompre'
}
