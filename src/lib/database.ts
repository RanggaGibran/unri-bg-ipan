import { supabase } from './supabase'
import { Student, StudentInsert, StudentUpdate, Statistics } from '../types/database'
import { mockStudents, mockStatistics } from './mockData'

// Fungsi untuk cek apakah Supabase sudah dikonfigurasi
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'
}

// Fungsi untuk mendapatkan semua mahasiswa
export async function getStudents() {
  try {
    if (!isSupabaseConfigured()) {
      return { data: mockStudents, error: null }
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      return { data: mockStudents, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getStudents:', error)
    return { data: mockStudents, error }
  }
}

// Fungsi untuk mendapatkan mahasiswa berdasarkan ID
export async function getStudentById(id: number) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching student:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getStudentById:', error)
    return { data: null, error }
  }
}

// Fungsi untuk membuat mahasiswa baru
export async function createStudent(student: StudentInsert) {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()

    if (error) {
      console.error('Error creating student:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createStudent:', error)
    return { data: null, error }
  }
}

// Fungsi untuk update mahasiswa
export async function updateStudent(id: number, student: StudentUpdate) {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ ...student, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating student:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateStudent:', error)
    return { data: null, error }
  }
}

// Fungsi untuk menghapus mahasiswa
export async function deleteStudent(id: number) {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting student:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in deleteStudent:', error)
    return { error }
  }
}

// Fungsi untuk mendapatkan mahasiswa yang belum kompre
export async function getActiveStudents() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_completed', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active students:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getActiveStudents:', error)
    return { data: null, error }
  }
}

// Fungsi untuk mendapatkan mahasiswa yang sudah kompre (arsip)
export async function getCompletedStudents() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_completed', true)
      .order('uk_date', { ascending: false })

    if (error) {
      console.error('Error fetching completed students:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getCompletedStudents:', error)
    return { data: null, error }
  }
}

// Fungsi untuk marking mahasiswa sebagai kompre
export async function markAsCompleted(id: number) {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ 
        is_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking student as completed:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in markAsCompleted:', error)
    return { data: null, error }
  }
}

// Fungsi untuk mendapatkan statistik
export async function getStatistics() {
  try {
    const { data: allStudents, error: allError } = await supabase
      .from('students')
      .select('id, is_completed')

    if (allError) {
      console.error('Error fetching statistics:', allError)
      return { data: null, error: allError }
    }

    const total = allStudents?.length || 0
    const completed = allStudents?.filter((s: { is_completed: boolean }) => s.is_completed).length || 0
    const active = total - completed

    return { 
      data: { total, completed, active },
      error: null 
    }
  } catch (error) {
    console.error('Error in getStatistics:', error)
    return { data: null, error }
  }
}

// Fungsi untuk validasi koneksi database
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection error:', error)
      return { connected: false, error }
    }

    return { connected: true, error: null }
  } catch (error) {
    console.error('Error testing connection:', error)
    return { connected: false, error }
  }
}
