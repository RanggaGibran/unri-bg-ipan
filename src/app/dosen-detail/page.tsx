"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getActiveStudents } from '@/lib/database'
import { Student } from '@/types/database'
import ProtectedRoute from '@/components/ProtectedRoute'

interface DosenData {
  name: string
  students: Student[]
  count: number
}

interface StudentDetailPopupProps {
  student: Student | null
  onClose: () => void
}

function StudentDetailPopup({ student, onClose }: StudentDetailPopupProps) {
  if (!student) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border-2 border-gray-700 max-w-md w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Detail Mahasiswa</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Mahasiswa
            </label>
            <p className="text-white font-semibold">{student.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              NIM
            </label>
            <p className="text-white font-mono">{student.nim}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Program Studi
            </label>
            <p className="text-white">{student.program_studi || 'Belum diisi'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Judul Proposal
            </label>
            <p className="text-white text-sm">{student.thesis_title || 'Belum diisi'}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pembimbing 1
              </label>
              <p className="text-white">{getCurrentSupervisor1(student) || 'Belum diisi'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Pembimbing 2
              </label>
              <p className="text-white">{getCurrentSupervisor2(student) || 'Belum diisi'}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status Progress
            </label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(student)}`}>
              {getStudentStatus(student)}
            </span>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
          <Link
            href={`/students/${student.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold border border-blue-500 mr-2"
            onClick={onClose}
          >
            Lihat Detail Lengkap
          </Link>
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold border border-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getCurrentSupervisor1(student: Student): string | null {
  if (student.uk_date) return student.shp_supervisor_1 || student.sup_supervisor_1 || student.supervisor_1
  if (student.shp_date) return student.shp_supervisor_1 || student.sup_supervisor_1 || student.supervisor_1
  if (student.sup_date) return student.sup_supervisor_1 || student.supervisor_1
  return student.supervisor_1
}

function getCurrentSupervisor2(student: Student): string | null {
  if (student.uk_date) return student.shp_supervisor_2 || student.sup_supervisor_2 || student.supervisor_2
  if (student.shp_date) return student.shp_supervisor_2 || student.sup_supervisor_2 || student.supervisor_2
  if (student.sup_date) return student.sup_supervisor_2 || student.supervisor_2
  return student.supervisor_2
}

function getStudentStatus(student: Student): string {
  if (student.uk_date) return 'UK (Ujian Komprehensif)'
  if (student.shp_date) return 'SHP (Seminar Hasil Penelitian)'
  if (student.sup_date) return 'SUP (Seminar Usulan Penelitian)'
  if (student.uj3_date) return 'UJ3 (Surat Tugas)'
  return 'Baru Daftar'
}

function getStatusBadgeStyle(student: Student): string {
  if (student.uk_date) return 'bg-orange-900/50 text-orange-300 border border-orange-600'
  if (student.shp_date) return 'bg-purple-900/50 text-purple-300 border border-purple-600'
  if (student.sup_date) return 'bg-green-900/50 text-green-300 border border-green-600'
  if (student.uj3_date) return 'bg-blue-900/50 text-blue-300 border border-blue-600'
  return 'bg-gray-900/50 text-gray-300 border border-gray-600'
}

export default function DosenDetailPage() {
  const [dosenData, setDosenData] = useState<DosenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDosenData()
  }, [])

  async function fetchDosenData() {
    setLoading(true)
    setError('')
    
    try {
      const { data: activeStudents, error: fetchError } = await getActiveStudents()
      
      if (fetchError) {
        const msg = typeof fetchError === 'string'
          ? fetchError
          : (fetchError as any)?.message || JSON.stringify(fetchError)
        setError('Gagal mengambil data mahasiswa: ' + msg)
        return
      }

      if (!activeStudents) {
        setError('Data mahasiswa tidak ditemukan')
        return
      }

      // Group students by their current supervisors
      const dosenMap = new Map<string, Student[]>()
      
      activeStudents.forEach((student: Student) => {
        const supervisor1 = getCurrentSupervisor1(student)
        const supervisor2 = getCurrentSupervisor2(student)
        
        if (supervisor1) {
          if (!dosenMap.has(supervisor1)) {
            dosenMap.set(supervisor1, [])
          }
          dosenMap.get(supervisor1)!.push(student)
        }
        
        if (supervisor2 && supervisor2 !== supervisor1) {
          if (!dosenMap.has(supervisor2)) {
            dosenMap.set(supervisor2, [])
          }
          dosenMap.get(supervisor2)!.push(student)
        }
      })

      // Convert map to array and sort by student count
      const dosenArray: DosenData[] = Array.from(dosenMap.entries())
        .map(([name, students]) => ({
          name,
          students,
          count: students.length
        }))
        .sort((a, b) => b.count - a.count)

      setDosenData(dosenArray)
    } catch (err) {
      console.error('Error fetching dosen data:', err)
      setError('Terjadi kesalahan saat mengambil data: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const filteredDosenData = dosenData.filter(dosen =>
    dosen.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStudents = dosenData.reduce((sum, dosen) => sum + dosen.count, 0)
  const totalDosen = dosenData.length

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-gray-900/95 rounded-2xl border-2 border-gray-700 shadow-2xl p-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">Memuat data dosen...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gray-900/95 rounded-2xl border-2 border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    👨‍🏫 Detail Dosen Pembimbing
                  </h1>
                  <p className="text-gray-300">
                    Daftar dosen dan mahasiswa yang sedang dibimbing
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href="/dosen-management"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold border border-purple-500"
                  >
                    ⚙️ Kelola Dosen
                  </Link>
                  <Link 
                    href="/"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold border border-gray-600"
                  >
                    ← Kembali
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 text-red-300 bg-red-900/30 border border-red-600/50 rounded-lg p-4 font-medium">
                  {error}
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-700">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">👨‍🏫</div>
                    <div>
                      <p className="text-sm text-gray-300">Total Dosen Aktif</p>
                      <p className="text-2xl font-bold text-blue-400">{totalDosen}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900/40 rounded-lg p-4 border border-green-700">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">👥</div>
                    <div>
                      <p className="text-sm text-gray-300">Total Bimbingan</p>
                      <p className="text-2xl font-bold text-green-400">{totalStudents}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-700">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📊</div>
                    <div>
                      <p className="text-sm text-gray-300">Rata-rata per Dosen</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {totalDosen > 0 ? Math.round((totalStudents / totalDosen) * 10) / 10 : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Cari nama dosen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Dosen List */}
              {filteredDosenData.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {searchTerm ? 'Tidak ada dosen yang sesuai' : 'Belum ada data dosen'}
                  </h3>
                  <p className="text-gray-300">
                    {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Belum ada mahasiswa aktif dengan pembimbing'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDosenData.map((dosen) => (
                    <div key={dosen.name} className="bg-gray-800/70 rounded-lg p-6 border border-gray-600">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{dosen.name}</h3>
                          <p className="text-gray-300">
                            Membimbing {dosen.count} mahasiswa aktif
                          </p>
                        </div>
                        <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-600">
                          {dosen.count} mahasiswa
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dosen.students.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className="text-left p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-600/50 transition-colors"
                          >
                            <div className="font-medium text-white mb-1">{student.name}</div>
                            <div className="text-sm text-gray-300 font-mono">{student.nim}</div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(student)}`}>
                                {getStudentStatus(student)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Popup */}
      <StudentDetailPopup 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />
    </ProtectedRoute>
  )
}
