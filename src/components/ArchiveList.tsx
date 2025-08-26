'use client'

import { Student } from '@/types/database'
import Link from 'next/link'

interface ArchiveListProps {
  students: Student[]
}

export default function ArchiveList({ students }: ArchiveListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Get the highest completed stage for a student
  const getCompletedStage = (student: Student) => {
    if (student.uk_date) return 'uk'
    if (student.shp_date) return 'shp'
    if (student.sup_date) return 'sup'
    if (student.uj3_date) return 'uj3'
    return 'none'
  }

  if (students.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg border border-gray-600/50 text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Tidak ada data yang ditemukan
        </h2>
        <p className="text-gray-300 mb-6">
          Coba ubah atau hapus beberapa filter untuk melihat lebih banyak hasil
        </p>
      </div>
    )
  }

  const stageLabels = {
    'uj3': { label: 'UJ3', color: 'bg-blue-600/80 text-blue-100', icon: '📝' },
    'sup': { label: 'SUP', color: 'bg-yellow-600/80 text-yellow-100', icon: '📊' },
    'shp': { label: 'SHP', color: 'bg-purple-600/80 text-purple-100', icon: '📋' },
    'uk': { label: 'UK', color: 'bg-green-600/80 text-green-100', icon: '🎓' },
    'none': { label: 'Belum', color: 'bg-gray-600/80 text-gray-100', icon: '⏳' }
  }

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-600/50 overflow-hidden">
      {/* Statistics Header */}
      <div className="bg-gray-700/30 px-6 py-4 border-b border-gray-600/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{students.length}</div>
            <div className="text-sm text-gray-300">Total Ditemukan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {students.filter(s => getCompletedStage(s) === 'uk').length}
            </div>
            <div className="text-sm text-gray-300">UK Selesai</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {students.filter(s => getCompletedStage(s) === 'shp').length}
            </div>
            <div className="text-sm text-gray-300">SHP Selesai</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {students.filter(s => getCompletedStage(s) === 'sup').length}
            </div>
            <div className="text-sm text-gray-300">SUP Selesai</div>
          </div>
        </div>
      </div>

      {/* Table View for larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-600/50 bg-gray-700/30">
              <th className="text-left py-3 px-4 font-semibold text-gray-200">NIM</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Nama</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Judul</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Tahapan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Tanggal UK</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Pembimbing</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: Student) => {
              const stage = getCompletedStage(student)
              const stageInfo = stageLabels[stage]
              
              return (
                <tr key={student.id} className="border-b border-gray-600/30 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{student.nim}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{student.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-300 truncate max-w-xs">
                      {student.thesis_title || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stageInfo.color}`}>
                      {stageInfo.icon} {stageInfo.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {formatDate(student.uk_date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    <div>{student.supervisor_1 || '-'}</div>
                    {student.supervisor_2 && (
                      <div className="text-xs text-gray-400">{student.supervisor_2}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/students/${student.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Card View for mobile */}
      <div className="md:hidden space-y-4 p-4">
        {students.map((student: Student) => {
          const stage = getCompletedStage(student)
          const stageInfo = stageLabels[stage]
          
          return (
            <div key={student.id} className="border border-gray-600/50 rounded-lg p-4 hover:shadow-md hover:bg-gray-700/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-white">{student.name}</div>
                  <div className="text-sm text-gray-300">{student.nim}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stageInfo.color}`}>
                  {stageInfo.icon} {stageInfo.label}
                </span>
              </div>
              
              {student.thesis_title && (
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Judul:</div>
                  <div className="text-sm text-gray-200">{student.thesis_title}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Tanggal UK:</div>
                  <div className="text-gray-200">{formatDate(student.uk_date)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Pembimbing:</div>
                  <div className="text-gray-200">
                    {student.supervisor_1 || '-'}
                    {student.supervisor_2 && (
                      <div className="text-xs">{student.supervisor_2}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Timeline badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {student.uj3_date && (
                  <span className="text-xs bg-blue-600/80 text-blue-100 px-2 py-1 rounded">
                    📝 UJ3: {formatDate(student.uj3_date)}
                  </span>
                )}
                {student.sup_date && (
                  <span className="text-xs bg-yellow-600/80 text-yellow-100 px-2 py-1 rounded">
                    📊 SUP: {formatDate(student.sup_date)}
                  </span>
                )}
                {student.shp_date && (
                  <span className="text-xs bg-purple-600/80 text-purple-100 px-2 py-1 rounded">
                    📋 SHP: {formatDate(student.shp_date)}
                  </span>
                )}
                {student.uk_date && (
                  <span className="text-xs bg-green-600/80 text-green-100 px-2 py-1 rounded">
                    🎓 UK: {formatDate(student.uk_date)}
                  </span>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-600/50">
                <Link
                  href={`/students/${student.id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Lihat Detail →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
