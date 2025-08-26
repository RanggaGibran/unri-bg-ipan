'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { getStatistics, getActiveStudents, getCompletedStudents } from '@/lib/database'
import { Student } from '@/types/database'
import Header from '@/components/Header'
import PageLayout from '@/components/PageLayout'
import Link from 'next/link'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const { settings } = useSettings()
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 })
  const [activeStudents, setActiveStudents] = useState<Student[]>([])
  const [completedStudents, setCompletedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false) // Track when data is actually loaded
  const [animationCompleted, setAnimationCompleted] = useState(false) // Track when typewriter animation is done
  
  // Rolling display states
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0)
  const [displayStudents, setDisplayStudents] = useState<Student[]>([])
  const [isRolling, setIsRolling] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, activeResult, completedResult] = await Promise.all([
          getStatistics(),
          getActiveStudents(), 
          getCompletedStudents()
        ])

        setStats(statsResult.data || { total: 0, completed: 0, active: 0 })
        setActiveStudents(activeResult.data || [])
        setCompletedStudents(completedResult.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setDataLoaded(true) // Mark data as loaded, but don't stop loading animation yet
      }
    }

    fetchData()
  }, [])

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

  // Helper function to get last activity
  const getLastActivity = (student: Student): { activity: string; daysAgo: number; status: string } => {
    const activities = [
      { date: student.uk_date, name: 'UK', fullName: 'Ujian Komprehensif', prefix: 'Telah UK' },
      { date: student.shp_date, name: 'SHP', fullName: 'Seminar Hasil Penelitian', prefix: 'Telah SHP' },
      { date: student.sup_date, name: 'SUP', fullName: 'Seminar Usulan Penelitian', prefix: 'Telah SUP' },
      { date: student.uj3_date, name: 'UJ3', fullName: 'Surat Tugas', prefix: 'Telah UJ3' }
    ]

    // Find the most recent activity
    const lastActivity = activities
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0]

    if (!lastActivity) {
      return { activity: 'Belum ada aktivitas', daysAgo: 0, status: 'Belum memulai' }
    }

    const daysAgo = Math.floor((Date.now() - new Date(lastActivity.date!).getTime()) / (1000 * 60 * 60 * 24))
    const statusText = daysAgo === 0 
      ? `${lastActivity.prefix} hari ini` 
      : `${lastActivity.prefix} ${daysAgo} hari yang lalu`
    
    return { 
      activity: lastActivity.fullName, 
      daysAgo,
      status: statusText
    }
  }

  // Setup rolling display with smoother animation
  useEffect(() => {
    if (activeStudents.length > 0) {
      // Get up to 10 active students for rolling display
      const studentsForDisplay = activeStudents.slice(0, 10)
      setDisplayStudents(studentsForDisplay)
      
      // Start rolling every 5 seconds with animation
      const interval = setInterval(() => {
        setIsRolling(true)
        setTimeout(() => {
          setCurrentStudentIndex(prev => (prev + 1) % studentsForDisplay.length)
          setTimeout(() => {
            setIsRolling(false)
          }, 100)
        }, 400) // Longer fade out
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [activeStudents])

  // Current student for display
  const currentStudent = displayStudents.length > 0 ? displayStudents[currentStudentIndex] : null
  const lastActivity = currentStudent ? getLastActivity(currentStudent) : null

  // Loading text animation state - Fixed and reliable
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)
  const [animationStarted, setAnimationStarted] = useState(false)
  
  const loadingTexts = [
    "Teknologi",
    "Pertanian", 
    "Jaya",
    "Jaya", 
    "Jaya",
    "Teknologi"
  ]

  // Fixed rotation effect - continuous and reliable
  useEffect(() => {
    if (loading) {
      setAnimationStarted(true)
      setLoadingTextIndex(0) // Reset to start
      
      const rotationInterval = setInterval(() => {
        setLoadingTextIndex(prev => {
          const next = (prev + 1) % loadingTexts.length
          console.log(`Loading animation: ${prev} -> ${next} (${loadingTexts[next]})`) // Debug log
          return next
        })
      }, 1200) // Change text every 1.2 seconds for better visibility

      return () => clearInterval(rotationInterval)
    } else {
      setAnimationStarted(false)
      setLoadingTextIndex(0)
    }
  }, [loading]) // Only depend on loading state

  // Mark animation as completed after showing full cycles
  useEffect(() => {
    if (loading && animationStarted) {
      const animationTimer = setTimeout(() => {
        setAnimationCompleted(true)
      }, 9000) // 9 seconds = more than one full cycle (6 words * 1.2s = 7.2s)
      
      return () => clearTimeout(animationTimer)
    }
  }, [loading, animationStarted])

  // Force data to complete loading after animations run for enough time
  useEffect(() => {
    if (loading) {
      // Ensure minimum loading time to show the beautiful animation
      const forceCompleteTimer = setTimeout(() => {
        setLoading(false)
      }, 12000) // 12 seconds = full cycle show plus extra time
      
      return () => clearTimeout(forceCompleteTimer)
    }
  }, [loading])

  if (loading) {
    return (
      <>
        <Header />
        <PageLayout className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-gray-900/98 backdrop-blur-xl rounded-3xl p-8 sm:p-12 lg:p-20 border-2 border-gray-600 shadow-2xl animate-fade-in-up relative overflow-hidden max-w-sm sm:max-w-2xl lg:max-w-4xl w-full">
            {/* Enhanced animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/15 rounded-full animate-float"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full animate-float-delayed"></div>
              <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-green-500/15 rounded-full animate-float"></div>
              <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-yellow-500/15 rounded-full animate-float-delayed"></div>
              <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-red-500/15 rounded-full animate-float"></div>
              <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-cyan-500/15 rounded-full animate-float-delayed"></div>
            </div>
            
            <div className="relative z-10">
              {/* University Logo/Icon */}
              <div className="mb-8 sm:mb-10">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6">🎓</div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">Sistem Progress Ujian Akhir</h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300">Teknologi Pertanian</p>
              </div>
              
              {/* Enhanced Gear Loading Animation */}
              <div className="relative mx-auto mb-8 sm:mb-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                {/* Main gear */}
                <div className="animate-gear-spin text-6xl sm:text-7xl lg:text-8xl filter drop-shadow-lg relative z-10">
                  ⚙️
                </div>
              </div>
              
              {/* Enhanced Dynamic loading text with smooth animation */}
              <div className="h-56 sm:h-64 lg:h-72 flex items-center justify-center mb-8 bg-gray-800/50 rounded-3xl border-2 border-gray-600 py-10 px-6 shadow-inner">
                <div className="text-center w-full">
                  <p className="text-gray-400 text-base sm:text-lg mb-4 uppercase tracking-wider font-semibold">
                    ✨ Animasi Loading Teknologi Pertanian ✨
                  </p>
                  <div className="min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem] flex items-center justify-center mb-6">
                    <div className="relative">
                      <p className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold transition-all duration-500 ease-in-out transform">
                        <span className={`inline-block transition-all duration-500 ${
                          loadingTextIndex === 0 || loadingTextIndex === 5 ? 'text-green-400 scale-125 drop-shadow-2xl glow-green animate-pulse' : 
                          loadingTextIndex === 1 ? 'text-blue-400 scale-115 drop-shadow-xl glow-blue' :
                          loadingTextIndex === 2 || loadingTextIndex === 3 || loadingTextIndex === 4 ? 'text-yellow-400 scale-125 animate-bounce drop-shadow-2xl glow-yellow' :
                          'text-gray-300'
                        }`}>
                          {loadingTexts[loadingTextIndex] || 'Loading...'}
                          <span className="inline-block w-2 h-12 sm:h-16 lg:h-20 bg-white ml-3 animate-pulse shadow-lg"></span>
                        </span>
                      </p>
                      
                      {/* Animation status indicator */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black/70 px-3 py-1 rounded-full text-xs text-white">
                          {animationStarted ? '🟢 Aktif' : '🔴 Siap'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Word progress indicators */}
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    {loadingTexts.map((text, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-500 ${
                          index === loadingTextIndex ? 
                            'bg-blue-500/30 border border-blue-400 text-blue-300 scale-110' : 
                          index < loadingTextIndex ? 
                            'bg-green-500/20 border border-green-500 text-green-400' :
                            'bg-gray-700/50 border border-gray-600 text-gray-500'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          index === loadingTextIndex ? 'bg-blue-400 animate-pulse' :
                          index < loadingTextIndex ? 'bg-green-400' : 'bg-gray-600'
                        }`} />
                        <span className="font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cycle counter */}
                  <div className="mt-3 space-y-2">
                    <p className="text-gray-400 text-xs">
                      Kata: {loadingTextIndex + 1}/{loadingTexts.length} - &quot;{loadingTexts[loadingTextIndex] || 'Loading...'}&quot;
                    </p>
                    <div className="text-gray-500 text-xs">
                      ⏱️ Animasi: {animationStarted ? 'Berjalan' : 'Menunggu'} | 
                      📊 Cycle: {Math.floor(loadingTextIndex / loadingTexts.length) + 1} | 
                      🔄 Status: {loadingTextIndex === 0 ? 'Mulai' : loadingTextIndex === loadingTexts.length - 1 ? 'Selesai' : 'Progress'}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg animate-pulse mb-6">
                {!dataLoaded ? '🔄 Memuat data dashboard...' : 
                 !animationCompleted ? '✨ Data siap! Menyelesaikan animasi...' : 
                 '🚀 Siap! Masuk ke dashboard...'}
              </p>
              
              {/* Progress indicators */}
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${dataLoaded ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50'}`}></div>
                  <span className="text-sm text-white font-medium">Data</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${animationCompleted ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50'}`}></div>
                  <span className="text-sm text-white font-medium">Animasi</span>
                </div>
              </div>
              
              <div className="mt-6 w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 shadow-lg ${
                    animationCompleted ? 
                    'bg-gradient-to-r from-green-400 via-blue-400 to-purple-400' :
                    'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x'
                  }`}
                  style={{
                    width: `${dataLoaded ? (animationCompleted ? 100 : 75) : 50}%`
                  }}>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.4s'}}></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Header />
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section dengan Background */}
          <header className="text-center mb-12">
            <div className="bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-700/50 shadow-2xl relative overflow-hidden animate-fade-in-up">
              {/* Animated Background Orbs */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cyan-500/10 rounded-full blur-lg animate-pulse-slow"></div>
              </div>
              
              {/* Content with relative positioning to stay above background */}
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg animate-glow">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                    Sistem Progress Ujian Akhir Mahasiswa
                  </span>
                </h1>
                <p className="text-lg text-gray-200 drop-shadow animate-fade-in-delay">
                  Monitoring dan pengelolaan progress ujian akhir mahasiswa
                </p>
              </div>
            </div>
            {!isSupabaseConfigured && (
              <div className="mt-4 bg-yellow-600/90 border-2 border-yellow-500 text-white px-4 py-3 rounded-xl shadow-lg">
                ⚠️ Konfigurasi Supabase diperlukan untuk menggunakan fitur lengkap
              </div>
            )}
          </header>

          {/* Dashboard Cards - Only show when authenticated */}
          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {/* Dashboard Mahasiswa Card */}
              <Link href="/students" className="bg-blue-600 border-2 border-blue-400 text-white p-6 rounded-2xl hover:bg-blue-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up">
                <div className="text-2xl mb-2 animate-bounce">📊</div>
                <h2 className="text-xl font-bold drop-shadow mb-4 group-hover:animate-pulse">
                  Dashboard Mahasiswa
                </h2>
                <p className="text-blue-100 mb-4 text-sm opacity-90">
                  Kelola data mahasiswa dan progress ujian akhir
                </p>
                <div className="text-white font-bold text-lg bg-blue-800/50 px-3 py-1 rounded-lg transform transition-transform group-hover:scale-110">
                  {stats.active} Mahasiswa Aktif
                </div>
              </Link>

              {/* Mahasiswa Kompre Card */}
              <Link href="/archive" className="bg-green-600 border-2 border-green-400 text-white p-6 rounded-2xl hover:bg-green-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="text-2xl mb-2 animate-bounce" style={{animationDelay: '1s'}}>✅</div>
                <h2 className="text-xl font-bold drop-shadow mb-4 group-hover:animate-pulse">
                  Mahasiswa Kompre
                </h2>
                <p className="text-green-100 mb-4 text-sm opacity-90">
                  Daftar mahasiswa yang sudah menyelesaikan ujian komprehensif
                </p>
                <div className="text-white font-bold text-lg bg-green-800/50 px-3 py-1 rounded-lg transform transition-transform group-hover:scale-110">
                  {stats.completed} Sudah Kompre
                </div>
              </Link>

              {/* Manajemen Dosen Card */}
              <Link href="/dosen-management" className="bg-orange-600 border-2 border-orange-400 text-white p-6 rounded-2xl hover:bg-orange-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="text-2xl mb-2 animate-bounce" style={{animationDelay: '1.2s'}}>👨‍🏫</div>
                <h2 className="text-xl font-bold drop-shadow mb-4 group-hover:animate-pulse">
                  Manajemen Dosen
                </h2>
                <p className="text-orange-100 mb-4 text-sm opacity-90">
                  Kelola data dosen pembimbing dan penguji
                </p>
                <div className="text-white font-bold text-lg bg-orange-800/50 px-3 py-1 rounded-lg transform transition-transform group-hover:scale-110">
                  CRUD Dosen
                </div>
              </Link>

              {/* Detail Dosen Card */}
              <Link href="/dosen-detail" className="bg-teal-600 border-2 border-teal-400 text-white p-6 rounded-2xl hover:bg-teal-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="text-2xl mb-2 animate-bounce" style={{animationDelay: '1.4s'}}>📋</div>
                <h2 className="text-xl font-bold drop-shadow mb-4 group-hover:animate-pulse">
                  Detail Dosen
                </h2>
                <p className="text-teal-100 mb-4 text-sm opacity-90">
                  Analisa beban dosen dan mahasiswa bimbingan
                </p>
                <div className="text-white font-bold text-lg bg-teal-800/50 px-3 py-1 rounded-lg transform transition-transform group-hover:scale-110">
                  Monitoring
                </div>
              </Link>

              {/* Statistik Card */}
              <div className="bg-purple-600 border-2 border-purple-400 text-white p-6 rounded-2xl shadow-lg text-center card-hover-effect animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <div className="text-2xl mb-2 animate-bounce" style={{animationDelay: '1.6s'}}>📈</div>
                <h2 className="text-xl font-bold drop-shadow mb-4">
                  Statistik
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between bg-purple-700/40 px-3 py-2 rounded-lg border border-purple-500/30">
                    <span className="text-purple-100 font-medium">Total Mahasiswa:</span>
                    <span className="font-bold text-white bg-purple-800/50 px-2 py-1 rounded">{stats.total}</span>
                  </div>
                  <div className="flex justify-between bg-purple-700/40 px-3 py-2 rounded-lg border border-purple-500/30">
                    <span className="text-purple-100 font-medium">Sudah Kompre:</span>
                    <span className="font-bold text-green-300 bg-green-900/40 px-2 py-1 rounded">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between bg-purple-700/40 px-3 py-2 rounded-lg border border-purple-500/30">
                    <span className="text-purple-100 font-medium">Dalam Progress:</span>
                    <span className="font-bold text-blue-300 bg-blue-900/40 px-2 py-1 rounded">{stats.active}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Public Welcome Message - Only show when not authenticated */}
          {!isAuthenticated && (
            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-8 mb-8 text-center">
              <div className="text-gray-300 text-6xl mb-6">🎓</div>
              <h2 className="text-2xl font-bold text-white mb-4">Selamat Datang di Sistem Progress Ujian Akhir</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Sistem monitoring dan pengelolaan progress ujian akhir mahasiswa dengan tahapan lengkap dari Surat Tugas (UJ3), SUP, SHP, hingga UK.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-700">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-lg font-bold text-white">Total Mahasiswa</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                </div>
                <div className="bg-green-900/40 rounded-lg p-4 border border-green-700">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-lg font-bold text-white">Sudah Kompre</div>
                  <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                </div>
                <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-700">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-lg font-bold text-white">Dalam Progress</div>
                  <div className="text-2xl font-bold text-purple-400">{stats.active}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Silakan login sebagai admin untuk mengakses fitur pengelolaan data
              </p>
            </div>
          )}

          {/* Rolling Student Display */}
          {displayStudents.length > 0 && currentStudent ? (
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white rounded-2xl p-6 mb-8 shadow-2xl border-2 border-blue-500 relative overflow-hidden animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/15 rounded-full blur-lg animate-float"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  <span className="flex items-center animate-fade-in-delay">
                    <span className="animate-bounce mr-2">👥</span> Mahasiswa Aktif (Rolling Display)
                    <span className="ml-3 text-sm bg-gray-800/60 px-3 py-1 rounded-full border border-gray-600/50 animate-pulse">
                      {currentStudentIndex + 1} / {displayStudents.length}
                    </span>
                  </span>
                  <div className="text-sm bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/40 animate-fade-in-delay">
                    ⏱️ Update setiap 5 detik
                  </div>
                </h3>
              
                <div className={`transition-all duration-500 ease-in-out ${isRolling ? 'opacity-30 transform scale-95 blur-sm' : 'opacity-100 transform scale-100 blur-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-2xl font-bold mb-2 text-white">{currentStudent.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-blue-100 font-mono">📋 NIM: {currentStudent.nim}</p>
                      {currentStudent.program_studi && (
                        <span className="text-xs bg-blue-900/60 text-blue-100 px-2 py-1 rounded font-semibold border border-blue-700/40" title="Program Studi">{currentStudent.program_studi}</span>
                      )}
                    </div>
                    {currentStudent.thesis_title && (
                      <div className="relative group mb-4">
                        <p className="text-blue-100 text-sm line-clamp-2 bg-gray-700/40 p-2 rounded border border-gray-600/40 cursor-pointer group-hover:line-clamp-none transition-all duration-200" title={currentStudent.thesis_title}>
                          📝 {currentStudent.thesis_title}
                        </p>
                        <span className="absolute left-0 top-full mt-1 w-max max-w-xs bg-gray-900 text-white text-xs rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 z-20 pointer-events-none transition-opacity duration-200" style={{whiteSpace: 'pre-line'}}>
                          {currentStudent.thesis_title}
                        </span>
                      </div>
                    )}
                    
                    {/* Pembimbing Section */}
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/40">
                      <h5 className="font-bold mb-3 text-white flex items-center">👨‍🏫 Pembimbing</h5>
                      {currentStudent.supervisor_1 || currentStudent.supervisor_2 ? (
                        <div className="space-y-2">
                          {currentStudent.supervisor_1 && (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold mr-2 text-black">1</div>
                              <p className="text-sm text-white">{currentStudent.supervisor_1}</p>
                            </div>
                          )}
                          {currentStudent.supervisor_2 && (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold mr-2 text-black">2</div>
                              <p className="text-sm text-white">{currentStudent.supervisor_2}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-gray-300 text-sm">⚠️ Belum ada pembimbing</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Activity Section */}
                  <div>
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/40 h-full">
                      <h5 className="font-bold mb-3 text-white flex items-center">📅 Aktivitas Terakhir</h5>
                      {lastActivity ? (
                        <div className="text-center">
                          <div className="bg-gray-600/50 rounded-lg p-3 mb-3 border border-gray-600/30">
                            <p className="text-xl font-bold mb-1 text-white">{lastActivity.activity}</p>
                            <p className="text-blue-200 text-sm">📖 Tahapan ujian</p>
                          </div>
                          <div className="bg-green-500/90 text-white rounded-lg p-3 font-bold shadow-lg">
                            🎉 {lastActivity.status}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-300 text-lg">🚀 Siap memulai perjalanan ujian</p>
                        </div>
                      )}
                      
                      {/* Progress Tahapan */}
                      <div className="mt-4 pt-4 border-t border-gray-600/40">
                        <p className="text-xs text-blue-200 mb-2 text-center">Progress Tahapan:</p>
                        <div className="flex justify-center space-x-3">
                          <div className="text-center">
                            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStudent.uj3_date ? 'bg-green-400' : 'bg-gray-500/50'}`} title="UJ3"></div>
                            <span className="text-xs text-white">UJ3</span>
                          </div>
                          <div className="text-center">
                            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStudent.sup_date ? 'bg-green-400' : 'bg-gray-500/50'}`} title="SUP"></div>
                            <span className="text-xs text-white">SUP</span>
                          </div>
                          <div className="text-center">
                            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStudent.shp_date ? 'bg-green-400' : 'bg-gray-500/50'}`} title="SHP"></div>
                            <span className="text-xs text-white">SHP</span>
                          </div>
                          <div className="text-center">
                            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStudent.uk_date ? 'bg-green-400' : 'bg-gray-500/50'}`} title="UK"></div>
                            <span className="text-xs text-white">UK</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          ) : activeStudents.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-8 mb-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">Belum ada mahasiswa aktif</h3>
              <p className="text-gray-300 mb-6">Tambahkan mahasiswa baru untuk mulai tracking progress ujian</p>
              <Link href="/students/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg border-2 border-blue-400">
                <span className="text-lg">+</span>
                <span>Tambah Mahasiswa</span>
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-8 mb-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white mx-auto mb-4"></div>
              <p className="text-white font-medium">Memuat data mahasiswa...</p>
            </div>
          )}

          {/* Progress Tahapan Ujian */}
          <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 p-6 rounded-2xl mb-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 drop-shadow-lg">Progress Tahapan Ujian</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-600 border-2 border-blue-400 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold drop-shadow-lg">{progressStats.uj3}</div>
                  <div className="text-sm font-medium">Surat Tugas (UJ3)</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-600 border-2 border-green-400 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold drop-shadow-lg">{progressStats.sup}</div>
                  <div className="text-sm font-medium">SUP</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 border-2 border-purple-400 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold drop-shadow-lg">{progressStats.shp}</div>
                  <div className="text-sm font-medium">SHP</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-600 border-2 border-orange-400 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold drop-shadow-lg">{progressStats.uk}</div>
                  <div className="text-sm font-medium">UK</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Only show when authenticated */}
          {isAuthenticated && (
            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl shadow-xl p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <h2 className="text-xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in-delay">🚀 Aksi Cepat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/students/new" className="bg-blue-600 border-2 border-blue-400 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">➕</div>
                  <div className="font-bold drop-shadow">Tambah Mahasiswa</div>
                  <div className="text-sm opacity-90">Daftarkan mahasiswa baru</div>
                </Link>
                <Link href="/students" className="bg-green-600 border-2 border-green-400 text-white p-4 rounded-2xl hover:bg-green-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">📊</div>
                  <div className="font-bold drop-shadow">Kelola Data</div>
                  <div className="text-sm opacity-90">Lihat & edit progress</div>
                </Link>
                <Link href="/dosen-management" className="bg-orange-600 border-2 border-orange-400 text-white p-4 rounded-2xl hover:bg-orange-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1.3s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">👨‍🏫</div>
                  <div className="font-bold drop-shadow">Dosen</div>
                  <div className="text-sm opacity-90">Kelola data dosen</div>
                </Link>
                <Link href="/dosen-detail" className="bg-teal-600 border-2 border-teal-400 text-white p-4 rounded-2xl hover:bg-teal-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1.35s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">📋</div>
                  <div className="font-bold drop-shadow">Analisa Dosen</div>
                  <div className="text-sm opacity-90">Beban bimbingan</div>
                </Link>
                <Link href="/archive" className="bg-purple-600 border-2 border-purple-400 text-white p-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1.4s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">📁</div>
                  <div className="font-bold drop-shadow">Arsip Kompre</div>
                  <div className="text-sm opacity-90">Mahasiswa lulus</div>
                </Link>
                <Link href="/settings" className="bg-gray-600 border-2 border-gray-400 text-white p-4 rounded-2xl hover:bg-gray-700 transition-all duration-300 text-center group transform hover:scale-105 shadow-lg hover:shadow-xl card-hover-effect animate-fade-in-up" style={{animationDelay: '1.6s'}}>
                  <div className="text-2xl mb-2 group-hover:animate-bounce">⚙️</div>
                  <div className="font-bold drop-shadow">Settings</div>
                  <div className="text-sm opacity-90">Konfigurasi aplikasi</div>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-lg">🔄 Mahasiswa Aktif Terbaru</h3>
              {activeStudents.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activeStudents.slice(0, 5).map((student: Student) => (
                    <div key={student.id} className="border-l-4 border-blue-400 pl-4 bg-gray-700/30 p-3 rounded border border-gray-600/30">
                      <div className="font-bold text-white drop-shadow">{student.name}</div>
                      <div className="text-sm text-gray-200">NIM: {student.nim}</div>
                      <div className="text-xs text-gray-300">
                        Update: {new Date(student.updated_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-300 text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  Belum ada mahasiswa aktif
                </div>
              )}
            </div>

            <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-lg">🎓 Kompre Terbaru</h3>
              {completedStudents.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {completedStudents.slice(0, 5).map((student: Student) => (
                    <div key={student.id} className="border-l-4 border-green-400 pl-4 bg-gray-700/30 p-3 rounded border border-gray-600/30">
                      <div className="font-bold text-white drop-shadow">{student.name}</div>
                      <div className="text-sm text-gray-200">NIM: {student.nim}</div>
                      <div className="text-xs text-gray-300">
                        Kompre: {student.uk_date ? new Date(student.uk_date).toLocaleDateString('id-ID') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-300 text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  Belum ada mahasiswa yang kompre
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-600/40">
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-700/30 p-6 rounded-2xl border border-gray-600/30">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-bold text-white mb-3 drop-shadow-lg">
                  Tahapan Ujian Akhir
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-600 border border-blue-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Surat Tugas (UJ3)
                  </span>
                  <span className="bg-green-600 border border-green-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    SUP (Seminar Usulan Penelitian)
                  </span>
                  <span className="bg-purple-600 border border-purple-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    SHP (Seminar Hasil Penelitian)
                  </span>
                  <span className="bg-orange-600 border border-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    UK (Ujian Komprehensif)
                  </span>
                </div>
              </div>
              <div className="text-center">
                <Link 
                  href="/students/new"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg border-2 border-blue-400 hover:shadow-xl"
                >
                  <span className="text-lg">+</span>
                  <span className="drop-shadow">Tambah Mahasiswa</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}
