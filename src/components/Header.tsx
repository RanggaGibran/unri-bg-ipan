'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backUrl?: string
}

export default function Header({ 
  title, 
  showBackButton = false, 
  backUrl = "/" 
}: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const { settings } = useSettings()
  const router = useRouter()

  // Use app name from settings if no title provided
  const displayTitle = title || settings.appName

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="bg-gray-900 shadow-lg border-b-2 border-gray-700 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and back button */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link
                href={backUrl}
                className="text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">{displayTitle}</h1>
            </div>
          </div>

          {/* Right side - Navigation and auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Navigation Links for authenticated users */}
                <nav className="hidden md:flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/students"
                    className="text-gray-300 hover:text-green-400 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Mahasiswa
                  </Link>
                  <Link
                    href="/archive"
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Arsip
                  </Link>
                  <Link
                    href="/data-management"
                    className="text-gray-300 hover:text-orange-400 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Data Management
                  </Link>
                  <Link
                    href="/settings"
                    className="text-gray-300 hover:text-pink-400 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Settings
                  </Link>
                </nav>

                {/* User info and logout */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Admin</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 border-2 border-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-bold shadow-lg transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Login button for non-authenticated users */
              <Link
                href="/login"
                className="bg-blue-600 border-2 border-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 font-bold shadow-lg transform hover:scale-105"
              >
                Login Admin
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-600">
            <div className="flex justify-center gap-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm font-semibold"
              >
                Dashboard
              </Link>
              <Link
                href="/students"
                className="text-gray-300 hover:text-green-400 transition-all duration-300 text-sm font-semibold"
              >
                Mahasiswa
              </Link>
              <Link
                href="/archive"
                className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm font-semibold"
              >
                Arsip
              </Link>
              <Link
                href="/data-management"
                className="text-gray-300 hover:text-orange-400 transition-all duration-300 text-sm font-semibold"
              >
                Data Management
              </Link>
              <Link
                href="/settings"
                className="text-gray-300 hover:text-pink-400 transition-all duration-300 text-sm font-semibold"
              >
                Settings
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
