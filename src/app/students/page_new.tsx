import { getActiveStudents, getCompletedStudents, getStatistics } from '@/lib/database'
import { Student } from '@/types/database'
import Link from 'next/link'

export default async function StudentsPage() {
  // Fetch data dari database
  const [statsResult, activeResult, completedResult] = await Promise.all([
    getStatistics(),
    getActiveStudents(),
    getCompletedStudents()
  ])

  const stats = statsResult.data || { total: 0, completed: 0, active: 0 }
  const activeStudents = activeResult.data || []
  const completedStudents = completedResult.data || []

  const getStatusBadge = (student: Student) => {
    if (student.is_completed) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Kompre</span>
    }
    if (student.uk_date) {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">UK</span>
    }
    if (student.shp_date) {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">SHP</span>
    }
    if (student.sup_date) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">SUP</span>
    }
    if (student.uj3_date) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">UJ3</span>
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Baru</span>
  }

  const getProgressPercentage = (student: Student) => {
    let progress = 0
    if (student.uj3_date) progress += 20
    if (student.sup_date) progress += 25
    if (student.shp_date) progress += 25
    if (student.uk_date) progress += 30
    return progress
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Kembali ke Dashboard
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Mahasiswa
              </h1>
              <p className="text-gray-600">
                Kelola data mahasiswa dan progress ujian akhir
              </p>
            </div>
            <Link
              href="/students/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              + Tambah Mahasiswa
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                👥
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mahasiswa</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                📚
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Dalam Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                🎓
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sudah Kompre</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Mahasiswa Aktif ({activeStudents.length})
            </h2>
          </div>
          <div className="p-6">
            {activeStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">NIM</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Update Terakhir</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((student: Student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{student.nim}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            {student.thesis_title && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {student.thesis_title}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(student)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-24">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${getProgressPercentage(student)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {getProgressPercentage(student)}%
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(student.updated_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/students/${student.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/students/${student.id}`}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mahasiswa aktif</h3>
                <p className="text-gray-500 mb-4">Tambahkan mahasiswa baru untuk memulai monitoring progress.</p>
                <Link
                  href="/students/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Tambah Mahasiswa Pertama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Completed Students (Preview) */}
        {completedStudents.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Mahasiswa Kompre Terbaru
              </h2>
              <Link
                href="/archive"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedStudents.slice(0, 6).map((student: Student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.nim}</div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        Kompre
                      </span>
                    </div>
                    {student.uk_date && (
                      <div className="text-xs text-gray-500">
                        UK: {new Date(student.uk_date).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
