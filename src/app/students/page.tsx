'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getActiveStudents, getStatistics } from '@/lib/database'
import Link from 'next/link'
import StudentsList from '@/components/StudentsList'
import AdvancedSearchFilter from '@/components/AdvancedSearchFilter'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import PageLayout from '@/components/PageLayout'
import { Student } from '@/types/database'

export default function StudentsPage() {
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 })
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, activeResult] = await Promise.all([
          getStatistics(),
          getActiveStudents()
        ])

        const fetchedStats = statsResult.data || { total: 0, completed: 0, active: 0 }
        const fetchedStudents = activeResult.data || []

        setStats(fetchedStats)
        setAllStudents(fetchedStudents)
        setFilteredStudents(fetchedStudents)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFilteredStudentsChange = useCallback((filtered: Student[]) => {
    setFilteredStudents(filtered)
  }, [])

  const filterConfig = useMemo(() => ({
    searchFields: ['name', 'nim', 'thesis_title', 'supervisor_1', 'supervisor_2', 'program_studi'],
    enableStageFilter: true,
    enableDateFilter: false,
    enableProgressFilter: true,
    enableYearFilter: true,
    enableProgramStudiFilter: true,
    dateField: 'uj3_date'
  }), [])

  if (loading) {
    return (
      <ProtectedRoute>
        <Header title="Management Mahasiswa" showBackButton backUrl="/" />
        <div className="min-h-screen bg-black py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border-2 border-gray-700 shadow-2xl p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Header title="Management Mahasiswa" showBackButton backUrl="/" />
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border-2 border-gray-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    📊 Management Mahasiswa
                  </h1>
                  <p className="text-gray-300">
                    Kelola data dan progress ujian akhir mahasiswa
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href="/students/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold border border-blue-500"
                  >
                  + Tambah Mahasiswa
                </Link>
                <Link 
                  href="/"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold border border-gray-500"
                >
                  ← Dashboard
                </Link>
                   <Link
                     href="/dosen-management"
                     className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold border border-purple-500"
                   >
                     👨‍🏫 Manajemen Dosen
                   </Link>
                   <Link
                     href="/dosen-detail"
                     className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold border border-emerald-500"
                   >
                     📊 Detail Dosen
                   </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {allStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Belum ada mahasiswa aktif
                </h2>
                <p className="text-gray-300 mb-6">
                  Tambahkan mahasiswa baru untuk mulai tracking progress ujian
                </p>
                <Link 
                  href="/students/new"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold border border-blue-500"
                >
                  + Tambah Mahasiswa Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Advanced Search and Filter Section */}
                <AdvancedSearchFilter 
                  students={allStudents}
                  onFilteredStudentsChange={handleFilteredStudentsChange}
                  config={filterConfig}
                  title="🔍 Pencarian & Filter Mahasiswa"
                />

                {/* Results Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">
                    {filteredStudents.length !== allStudents.length ? (
                      <>Hasil Filter: {filteredStudents.length} dari {allStudents.length} mahasiswa</>
                    ) : (
                      <>Mahasiswa Aktif ({allStudents.length})</>
                    )}
                  </h2>
                  <div className="flex gap-2">
                    <span className="bg-blue-600/90 text-white px-3 py-1 rounded-full text-sm border border-blue-500">UJ3</span>
                    <span className="bg-green-600/90 text-white px-3 py-1 rounded-full text-sm border border-green-500">SUP</span>
                    <span className="bg-purple-600/90 text-white px-3 py-1 rounded-full text-sm border border-purple-500">SHP</span>
                    <span className="bg-orange-600/90 text-white px-3 py-1 rounded-full text-sm border border-orange-500">UK</span>
                  </div>
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Tidak ada mahasiswa yang sesuai
                    </h3>
                    <p className="text-gray-300">
                      Coba ubah kriteria pencarian atau filter
                    </p>
                  </div>
                ) : (
                  <StudentsList students={filteredStudents} />
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
