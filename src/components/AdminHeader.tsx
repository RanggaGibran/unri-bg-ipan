'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-green-600 text-xl">✅</div>
          <div>
            <p className="text-sm font-medium text-gray-800">Admin Panel</p>
            <p className="text-xs text-gray-500">Sistem Progress Ujian Akhir</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span className="text-blue-600">👤</span>
            <span>Administrator</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            title="Logout dari sistem"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">🚪</span>
          </button>
        </div>
      </div>
    </div>
  )
}
