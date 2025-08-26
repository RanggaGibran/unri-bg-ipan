'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { getStudentById } from '@/lib/database'
import { Student } from '@/types/database'
import EditProgressForm from '@/components/EditProgressForm'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditProgressPage({ params }: PageProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const studentId = parseInt(params.id)
  
  useEffect(() => {
    const fetchStudent = async () => {
      if (isNaN(studentId)) {
        router.push('/404')
        return
      }

      try {
        const { data: studentData, error: fetchError } = await getStudentById(studentId)
        
        if (fetchError || !studentData) {
          setError('Mahasiswa tidak ditemukan')
        } else {
          setStudent(studentData)
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [studentId, router])

  if (loading) {
    return (
      <ProtectedRoute>
        <Header title="Edit Progress Mahasiswa" showBackButton backUrl="/students" />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !student) {
    return (
      <ProtectedRoute>
        <Header title="Edit Progress Mahasiswa" showBackButton backUrl="/students" />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {error || 'Mahasiswa Tidak Ditemukan'}
              </h2>
              <p className="text-gray-600 mb-6">
                Data mahasiswa yang Anda cari tidak dapat ditemukan.
                Data mahasiswa yang Anda cari tidak dapat ditemukan.
              </p>
              <button
                onClick={() => router.push('/students')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali ke Daftar Mahasiswa
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Header title="Edit Progress Mahasiswa" showBackButton backUrl="/students" />
      <EditProgressForm studentId={studentId} initialData={student} />
    </ProtectedRoute>
  )
}
