'use client'

import { Student } from '@/types/database'
import Link from 'next/link'

interface StudentsListProps {
  students: Student[]
}

export default function StudentsList({ students }: StudentsListProps) {
  const getStatusBadge = (student: Student) => {
    if (student.is_completed) {
      return <span className="bg-green-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-green-500">Kompre</span>
    }
    if (student.uk_date) {
      return <span className="bg-orange-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-orange-500">UK</span>
    }
    if (student.shp_date) {
      return <span className="bg-purple-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-purple-500">SHP</span>
    }
    if (student.sup_date) {
      return <span className="bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-blue-500">SUP</span>
    }
    if (student.uj3_date) {
      return <span className="bg-yellow-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-yellow-500">UJ3</span>
    }
    return <span className="bg-gray-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold border border-gray-500">Baru</span>
  }

  const getProgressPercentage = (student: Student): number => {
    let progress = 0
    if (student.uj3_date) progress += 25
    if (student.sup_date) progress += 25
    if (student.shp_date) progress += 25
    if (student.uk_date) progress += 25
    return progress
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📚</div>
        <p className="text-gray-300">Tidak ada mahasiswa yang ditemukan</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div key={student.id} className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Student Info */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                  <p className="text-gray-300 font-mono text-sm">{student.nim}</p>
                  {student.program_studi && (
                    <p className="text-blue-400 text-sm font-medium">{student.program_studi}</p>
                  )}
                  {student.thesis_title && (
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2">{student.thesis_title}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(student)}
                    <span className="text-xs text-gray-400">
                      Progress: {getProgressPercentage(student)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="lg:w-48">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage(student)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(student)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span className={student.uj3_date ? 'text-blue-400' : ''}>UJ3</span>
                <span className={student.sup_date ? 'text-green-400' : ''}>SUP</span>
                <span className={student.shp_date ? 'text-purple-400' : ''}>SHP</span>
                <span className={student.uk_date ? 'text-orange-400' : ''}>UK</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/students/${student.id}`}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium border border-blue-500"
              >
                Detail
              </Link>
              <Link
                href={`/students/${student.id}/edit`}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-500"
              >
                Edit
              </Link>
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">UJ3:</span>
                <span className="ml-1 text-gray-200">{formatDate(student.uj3_date)}</span>
              </div>
              <div>
                <span className="text-gray-400">SUP:</span>
                <span className="ml-1 text-gray-200">{formatDate(student.sup_date)}</span>
              </div>
              <div>
                <span className="text-gray-400">SHP:</span>
                <span className="ml-1 text-gray-200">{formatDate(student.shp_date)}</span>
              </div>
              <div>
                <span className="text-gray-400">UK:</span>
                <span className="ml-1 text-gray-200">{formatDate(student.uk_date)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
