'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <PageLayout className="flex items-center justify-center px-4">
        <div className="text-center bg-gray-900/95 backdrop-blur-xl rounded-3xl p-12 border-2 border-gray-700 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-white mx-auto mb-6"></div>
          <p className="text-white text-xl font-bold">Memeriksa status login...</p>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <PageLayout className="flex items-center justify-center px-4">
        <div className="text-center bg-gray-900/95 backdrop-blur-xl rounded-3xl p-12 border-2 border-gray-700 shadow-2xl">
          <div className="text-6xl mb-6">✅</div>
          <p className="text-white text-xl font-bold mb-4">Login Berhasil!</p>
          <p className="text-gray-300">Mengalihkan ke dashboard...</p>
          <div className="mt-6 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!password.trim()) {
      setError('Password tidak boleh kosong')
      setIsLoading(false)
      return
    }

    try {
      const success = await login(password)
      if (success) {
        router.push('/')
      } else {
        setError('Password salah! Silakan coba lagi.')
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card with Enhanced Dark Design */}
        <div className="bg-gray-900/95 backdrop-blur-2xl rounded-3xl border-2 border-gray-700 shadow-2xl p-10 relative">
          {/* Bright decorative corner elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-pink-500 to-red-600 rounded-full animate-pulse shadow-lg" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full animate-pulse shadow-lg" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full animate-pulse shadow-lg" style={{animationDelay: '3s'}}></div>

          {/* Header with High Contrast Text */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-gray-600">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Admin Portal
            </h1>
            <p className="text-gray-200 text-xl font-semibold mb-2">
              Sistem Progress Ujian Akhir
            </p>
            <p className="text-gray-300 text-sm mb-6">
              Universitas Riau - Dashboard Administrator
            </p>
            <div className="inline-flex items-center bg-green-600/90 text-white px-6 py-3 rounded-full text-sm font-bold border-2 border-green-500 shadow-xl">
              <div className="w-3 h-3 bg-green-300 rounded-full mr-3 animate-pulse shadow-lg"></div>
              🔐 Secure Login Portal
            </div>
          </div>

          {/* Login Form with High Contrast Design */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-bold text-white mb-4 tracking-wide">
                🔑 Password Administrator
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full px-6 py-5 bg-gray-800 border-2 border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg font-medium group-hover:border-gray-500 shadow-lg"
                  disabled={isLoading}
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                  <div className="text-gray-400 text-xl">🔒</div>
                </div>
                {/* Input glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/90 border-2 border-red-500 text-white px-6 py-5 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">⚠️</span>
                  <span className="font-bold text-lg">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-blue-500"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent mr-4"></div>
                  <span className="text-xl">Memverifikasi...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-4 text-xl">🚀</span>
                  <span className="text-xl">Masuk ke Sistem</span>
                </div>
              )}
            </button>
          </form>

          {/* Dashboard Link with High Contrast */}
          <div className="mt-10 pt-8 border-t border-gray-600">
            <div className="text-center">
              <p className="text-white mb-6 font-bold text-lg">
                Ingin melihat dashboard publik?
              </p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-8 py-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 font-bold border-2 border-gray-600 transform hover:scale-105 shadow-xl text-lg"
              >
                <span className="mr-4 text-xl">📊</span>
                <span>Dashboard Publik</span>
              </button>
            </div>
          </div>

          {/* Feature Highlights with High Contrast */}
          <div className="mt-10 pt-8 border-t border-gray-600">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-3xl mb-3">📈</div>
                <div className="text-white text-sm font-bold">Real-time Monitoring</div>
                <div className="text-gray-300 text-xs mt-1">Live Updates</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="text-3xl mb-3">🔒</div>
                <div className="text-white text-sm font-bold">Secure Access</div>
                <div className="text-gray-300 text-xs mt-1">Protected Data</div>
              </div>
            </div>
          </div>

          {/* System Status with High Contrast */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-green-600/90 rounded-full px-6 py-3 border-2 border-green-500 shadow-xl">
              <div className="w-3 h-3 bg-green-300 rounded-full mr-4 animate-pulse shadow-lg"></div>
              <span className="text-white text-sm font-bold tracking-wide">Sistem Online & Aktif</span>
            </div>
          </div>
        </div>

        {/* Footer with High Contrast */}
        <div className="text-center mt-8">
          <div className="bg-gray-900/95 rounded-2xl p-6 border-2 border-gray-700 shadow-xl">
            <p className="text-white text-lg mb-3 font-bold">
              🎓 Universitas Riau
            </p>
            <p className="text-gray-300 text-sm font-semibold">
              Sistem Progress Ujian Akhir Mahasiswa v2.0
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
