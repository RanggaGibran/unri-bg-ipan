'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getCompletedStudents } from '@/lib/database'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import PageLayout from '@/components/PageLayout'
import AdvancedSearchFilter from '@/components/AdvancedSearchFilter'
import ArchiveList from '@/components/ArchiveList'
import { Student } from '@/types/database'

export default function ArchivePage() {
  const [completedStudents, setCompletedStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCompletedStudents()
        const students = result.data || []
        setCompletedStudents(students)
        setFilteredStudents(students)
      } catch (error) {
        console.error('Error fetching completed students:', error)
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
    enableDateFilter: true,
    enableProgressFilter: false,
    enableYearFilter: true,
    enableProgramStudiFilter: true,
    dateField: 'uk_date'
  }), [])

  if (loading) {
    return (
      <ProtectedRoute>
        <Header title="Arsip Mahasiswa Kompre" showBackButton backUrl="/" />
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
      <Header title="Arsip Mahasiswa Kompre" showBackButton backUrl="/" />
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 space-y-6 py-8">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">📁 Arsip Mahasiswa Kompre</h1>
            <p className="text-green-100">
              Daftar mahasiswa yang sudah menyelesaikan ujian komprehensif
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 rounded-full px-2 py-1">
                  📊 Total: {completedStudents.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 rounded-full px-2 py-1">
                  🔍 Ditampilkan: {filteredStudents.length}
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Search Filter */}
          <AdvancedSearchFilter
            students={completedStudents}
            onFilteredStudentsChange={handleFilteredStudentsChange}
            config={filterConfig}
            title="🔍 Pencarian & Filter Arsip"
          />

          {/* Archive List */}
          <ArchiveList students={filteredStudents} />

          {/* Test component untuk memverifikasi styling input */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Test Input Visibility</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  id="nim"
                  name="nim"
                  placeholder="Contoh: 20210001"
                  className="w-full px-3 py-2 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400"
                  required
                />

                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400 text-base"
                  placeholder="Masukkan password admin"
                  required
                />

                <select className="w-full px-3 py-2 border-2 border-gray-600 rounded-md bg-gray-800 text-white">
                  <option value="">Pilih option</option>
                  <option value="1">Option 1</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
