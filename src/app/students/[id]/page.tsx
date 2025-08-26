import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStudentById } from '@/lib/database'

interface PageProps {
  params: {
    id: string
  }
}

export default async function StudentDetailPage({ params }: PageProps) {
  const studentId = parseInt(params.id)
  
  if (isNaN(studentId)) {
    notFound()
  }

  const { data: student, error } = await getStudentById(studentId)

  if (error || !student) {
    notFound()
  }

  const stages = [
    { 
      name: 'Surat Tugas (UJ3)', 
      date: student.uj3_date,
      completed: !!student.uj3_date,
      color: 'blue',
      details: [
        { label: 'Pembimbing 1', value: student.supervisor_1 },
        { label: 'Pembimbing 2', value: student.supervisor_2 }
      ]
    },
    { 
      name: 'SUP (Seminar Usulan Penelitian)', 
      date: student.sup_date,
      completed: !!student.sup_date,
      color: 'green',
      details: [
        { label: 'Pembimbing 1', value: student.sup_supervisor_1 },
        { label: 'Pembimbing 2', value: student.sup_supervisor_2 },
        { label: 'Penguji 1', value: student.sup_examiner_1 },
        { label: 'Penguji 2', value: student.sup_examiner_2 }
      ]
    },
    { 
      name: 'SHP (Seminar Hasil Penelitian)', 
      date: student.shp_date,
      completed: !!student.shp_date,
      color: 'purple',
      details: [
        { label: 'Pembimbing 1', value: student.shp_supervisor_1 },
        { label: 'Pembimbing 2', value: student.shp_supervisor_2 },
        { label: 'Penguji 1', value: student.shp_examiner_1 },
        { label: 'Penguji 2', value: student.shp_examiner_2 }
      ]
    },
    { 
      name: 'UK (Ujian Komprehensif)', 
      date: student.uk_date,
      completed: !!student.uk_date,
      color: 'orange',
      details: [
        { label: 'Penguji 1', value: student.uk_examiner_1 },
        { label: 'Penguji 2', value: student.uk_examiner_2 },
        { label: 'Penguji 3', value: student.uk_examiner_3 },
        { label: 'Penguji 4', value: student.uk_examiner_4 }
      ]
    }
  ]

  const completedStages = stages.filter(s => s.completed).length
  const progressPercent = (completedStages / stages.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gray-900/95 rounded-2xl border-2 border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  📋 Detail Mahasiswa
                </h1>
                <p className="text-gray-300">
                  Progress ujian akhir dan informasi lengkap
                </p>
              </div>
              <div className="flex gap-2">
                <Link 
                  href={`/students/${student.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold border border-blue-500"
                >
                  ✏️ Edit Progress
                </Link>
                <Link 
                  href="/students"
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold border border-gray-600"
                >
                  ← Kembali
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-800/70 rounded-lg p-6 border border-gray-600">
              <h2 className="text-lg font-semibold text-white mb-4">
                📄 Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nama Mahasiswa
                  </label>
                  <p className="text-white font-semibold text-lg">{student.name}</p>
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
                  <p className="text-white font-semibold">
                    {student.program_studi || 'Belum diisi'}
                  </p>
                </div>
                <div></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Judul Proposal
                  </label>
                  <p className="text-white">
                    {student.thesis_title || 'Belum diisi'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Izin Penelitian
                  </label>
                  <p className="text-white">
                    {student.research_permit || 'Belum diisi'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-blue-900/40 rounded-lg p-6 border border-blue-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                📊 Progress Overview
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 font-medium">Progress Keseluruhan</span>
                    <span className="text-lg font-bold text-blue-400">
                      {completedStages}/4 ({Math.round(progressPercent)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stages.map((stage) => (
                  <div 
                    key={stage.name}
                    className={`text-center p-3 rounded-lg border ${
                      stage.completed 
                        ? `bg-${stage.color}-900/40 border-${stage.color}-600` 
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  >
                    <div className={`text-2xl mb-1 ${
                      stage.completed ? `text-${stage.color}-400` : 'text-gray-500'
                    }`}>
                      {stage.completed ? '✅' : '⏳'}
                    </div>
                    <div className={`text-sm font-medium ${
                      stage.completed ? `text-${stage.color}-300` : 'text-gray-400'
                    }`}>
                      {stage.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  student.is_completed 
                    ? 'bg-green-900/50 text-green-300 border border-green-600' 
                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                }`}>
                  {student.is_completed ? '🎓 Sudah Kompre' : '📚 Dalam Progress'}
                </span>
              </div>
            </div>

            {/* Detailed Progress */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">
                📋 Detail Progress Tahapan
              </h2>
              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div 
                    key={stage.name}
                    className={`rounded-lg border-2 ${
                      stage.completed 
                        ? `border-${stage.color}-600 bg-${stage.color}-900/30` 
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-semibold text-lg ${
                          stage.completed 
                            ? `text-${stage.color}-300` 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">
                            {stage.completed ? '✅' : '⏳'}
                          </span>
                          {stage.name}
                        </h3>
                        {stage.date && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            stage.completed 
                              ? `bg-${stage.color}-900/50 text-${stage.color}-300 border-${stage.color}-600` 
                              : 'bg-gray-800 text-gray-300 border-gray-600'
                          }`}>
                            {new Date(stage.date).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>

                      {stage.completed ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stage.details.map((detail) => (
                            detail.value && (
                              <div key={detail.label}>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                  {detail.label}
                                </label>
                                <p className="text-white font-medium">{detail.value}</p>
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          Tahapan ini belum dilaksanakan
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Informasi Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  Dibuat: {new Date(student.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div>
                  Terakhir diupdate: {new Date(student.updated_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
