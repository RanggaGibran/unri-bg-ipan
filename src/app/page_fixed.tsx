import { getStatistics, getActiveStudents, getCompletedStudents } from '@/lib/database'
import { Student } from '@/types/database'
import Link from 'next/link'

export default async function Home() {
  // Fetch data dari database dengan error handling
  const [statsResult, activeResult, completedResult] = await Promise.all([
    getStatistics(),
    getActiveStudents(), 
    getCompletedStudents()
  ])

  const stats = statsResult.data || { total: 0, completed: 0, active: 0 }
  const activeStudents = activeResult.data || []
  const completedStudents = completedResult.data || []

  // Hitung progress berdasarkan tahapan
  const progressStats = {
    uj3: activeStudents.filter((s: Student) => s.uj3_date).length,
    sup: activeStudents.filter((s: Student) => s.sup_date).length,
    shp: activeStudents.filter((s: Student) => s.shp_date).length,
    uk: activeStudents.filter((s: Student) => s.uk_date).length,
  }

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                               process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sistem Progress Ujian Akhir Mahasiswa
          </h1>
          <p className="text-lg text-gray-600">
            Monitoring dan pengelolaan progress ujian akhir mahasiswa
          </p>
          {!isSupabaseConfigured && (
            <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              ⚠️ Konfigurasi Supabase diperlukan untuk menggunakan fitur lengkap
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Dashboard Cards */}
            <Link href="/students" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                📊 Dashboard Mahasiswa
              </h2>
              <p className="text-gray-700 mb-4">
                Kelola data mahasiswa dan progress ujian akhir
              </p>
              <div className="text-blue-600 font-semibold">
                {stats.active} Mahasiswa Aktif
              </div>
            </Link>

            <Link href="/archive" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                ✅ Mahasiswa Kompre
              </h2>
              <p className="text-gray-700 mb-4">
                Daftar mahasiswa yang sudah menyelesaikan ujian komprehensif
              </p>
              <div className="text-green-600 font-semibold">
                {stats.completed} Sudah Kompre
              </div>
            </Link>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
                📈 Statistik
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Mahasiswa:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sudah Kompre:</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dalam Progress:</span>
                  <span className="font-semibold text-blue-600">{stats.active}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tahapan */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Progress Tahapan Ujian
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{progressStats.uj3}</div>
                  <div className="text-sm">Surat Tugas (UJ3)</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{progressStats.sup}</div>
                  <div className="text-sm">SUP</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{progressStats.shp}</div>
                  <div className="text-sm">SHP</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{progressStats.uk}</div>
                  <div className="text-sm">UK</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔄 Mahasiswa Aktif Terbaru
              </h3>
              {activeStudents.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activeStudents.slice(0, 5).map((student: Student) => (
                    <div key={student.id} className="border-l-4 border-blue-400 pl-4">
                      <div className="font-semibold text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">NIM: {student.nim}</div>
                      <div className="text-xs text-gray-500">
                        Update: {new Date(student.updated_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Belum ada mahasiswa aktif
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎓 Kompre Terbaru
              </h3>
              {completedStudents.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {completedStudents.slice(0, 5).map((student: Student) => (
                    <div key={student.id} className="border-l-4 border-green-400 pl-4">
                      <div className="font-semibold text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">NIM: {student.nim}</div>
                      <div className="text-xs text-gray-500">
                        Kompre: {student.uk_date ? new Date(student.uk_date).toLocaleDateString('id-ID') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Belum ada mahasiswa yang kompre
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tahapan Ujian Akhir
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Surat Tugas (UJ3)
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    SUP (Seminar Usulan Penelitian)
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    SHP (Seminar Hasil Penelitian)
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    UK (Ujian Komprehensif)
                  </span>
                </div>
              </div>
              <div className="text-center">
                <Link 
                  href="/students/new"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  + Tambah Mahasiswa Baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
