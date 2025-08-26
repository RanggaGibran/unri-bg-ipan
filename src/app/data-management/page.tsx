'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import DataManagementPanel from '@/components/DataManagementPanel'

export default function DataManagementPage() {
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info')

  const handleStatusChange = (message: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(message)
    setStatusType(type)
    setTimeout(() => setStatusMessage(''), 5000)
  }

  return (
    <ProtectedRoute>
      <Header title="Data Management" showBackButton backUrl="/settings" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 px-8 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">🗄️ Advanced Data Management</h1>
              <p className="text-indigo-100">
                Kelola backup, restore, export, import, dan sinkronisasi data mahasiswa
              </p>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div className={`px-8 py-4 border-b ${
                statusType === 'success' ? 'bg-green-50 border-green-200' :
                statusType === 'error' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  statusType === 'success' ? 'text-green-800' :
                  statusType === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {statusMessage}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <DataManagementPanel onStatusChange={handleStatusChange} />
              
              {/* Help Section */}
              <div className="mt-8 p-6 bg-gray-800/30 rounded-lg border border-blue-400/40 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-blue-100 mb-3">📖 Bantuan Data Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
                  <div>
                    <h4 className="font-medium mb-2">💾 Backup & Restore</h4>
                    <ul className="space-y-1">
                      <li>• Backup lengkap database dalam format JSON</li>
                      <li>• Restore dari file backup dengan validasi</li>
                      <li>• Auto backup berkala dengan cleanup otomatis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📊 Export & Import</h4>
                    <ul className="space-y-1">
                      <li>• Export ke Excel/CSV untuk analisis</li>
                      <li>• Export ke JSON untuk integrasi API</li>
                      <li>• Import dengan validasi data lengkap</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🔄 Synchronization</h4>
                    <ul className="space-y-1">
                      <li>• Sync dengan sistem eksternal (SIAKAD)</li>
                      <li>• Support import, export, atau bidirectional</li>
                      <li>• Konfigurasi API key dan endpoint</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🧹 Maintenance</h4>
                    <ul className="space-y-1">
                      <li>• Cleanup data temporary otomatis</li>
                      <li>• Hapus cache dan backup lama</li>
                      <li>• Optimisasi performa database</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
