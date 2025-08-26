'use client'

import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import PageLayout from '@/components/PageLayout'
import DataManagementPanel from '@/components/DataManagementPanel'

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings, lastSaved } = useSettings()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'features' | 'display' | 'backup' | 'data'>('general')
  const [saveMessage, setSaveMessage] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleSave = () => {
    // Settings are auto-saved through context
    setSaveMessage('✅ Pengaturan berhasil disimpan!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?')) {
      resetSettings()
      setSaveMessage('🔄 Pengaturan direset ke default!')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      setSaveMessage('❌ Password tidak boleh kosong!')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        setSaveMessage('✅ Password berhasil diubah!')
        setNewPassword('')
        // Auto logout after password change
        setTimeout(() => {
          logout()
        }, 2000)
      } else {
        setSaveMessage('❌ Gagal mengubah password!')
      }
    } catch (error) {
      setSaveMessage('❌ Terjadi kesalahan!')
    }
    
    setTimeout(() => setSaveMessage(''), 5000)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (importSettings(result)) {
        setSaveMessage('✅ Pengaturan berhasil diimpor!')
      } else {
        setSaveMessage('❌ File pengaturan tidak valid!')
      }
      setTimeout(() => setSaveMessage(''), 3000)
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const tabs = [
    { id: 'general', name: 'Umum', icon: '⚙️' },
    { id: 'security', name: 'Keamanan', icon: '🔐' },
    { id: 'features', name: 'Fitur', icon: '🔧' },
    { id: 'display', name: 'Tampilan', icon: '🎨' },
    { id: 'backup', name: 'Backup', icon: '💾' },
    { id: 'data', name: 'Data Management', icon: '🗄️' }
  ]

  return (
    <ProtectedRoute>
      <Header title="Pengaturan Aplikasi" showBackButton backUrl="/" />
      <PageLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gray-800/30 backdrop-blur-md border-2 border-gray-600/50 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">⚙️ Pengaturan Aplikasi</h1>
              <p className="text-blue-100">Kelola konfigurasi dan preferensi sistem</p>
              {lastSaved && (
                <p className="text-blue-200 text-sm mt-2">
                  Terakhir disimpan: {lastSaved.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`mx-8 mt-4 p-4 rounded-lg border ${
                saveMessage.includes('✅') 
                  ? 'bg-green-900/30 text-green-300 border-green-600/50' 
                  : saveMessage.includes('🔄')
                  ? 'bg-blue-900/30 text-blue-300 border-blue-600/50'
                  : 'bg-red-900/30 text-red-300 border-red-600/50'
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="flex flex-col lg:flex-row">
              {/* Sidebar Navigation */}
              <div className="lg:w-64 bg-gray-700/30 p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-200 hover:bg-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8 bg-gray-800/20">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Pengaturan Umum</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Nama Aplikasi
                        </label>
                        <input
                          type="text"
                          value={settings.appName}
                          onChange={(e) => updateSettings({ appName: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Deskripsi Aplikasi
                        </label>
                        <textarea
                          value={settings.appDescription}
                          onChange={(e) => updateSettings({ appDescription: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.enablePublicStats}
                            onChange={(e) => updateSettings({ enablePublicStats: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-gray-200">Tampilkan Statistik Publik</div>
                            <div className="text-sm text-gray-400">Pengunjung dapat melihat statistik dasar tanpa login</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => updateSettings({ maintenanceMode: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <div>
                            <div className="font-medium text-gray-200">Mode Maintenance</div>
                            <div className="text-sm text-gray-400">Nonaktifkan akses sementara untuk maintenance</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Pengaturan Keamanan</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Durasi Session (Jam)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={settings.sessionDuration}
                          onChange={(e) => updateSettings({ sessionDuration: parseInt(e.target.value) || 24 })}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Admin akan logout otomatis setelah {settings.sessionDuration} jam tidak aktif
                        </p>
                      </div>

                      <div className="border-t border-gray-600 pt-4">
                        <h3 className="text-lg font-medium text-white mb-4">Ubah Password Admin</h3>
                        <div className="flex gap-4">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Password baru"
                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                          />
                          <button
                            onClick={handlePasswordChange}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Ubah Password
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Anda akan logout otomatis setelah password berhasil diubah
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.requireStrongPassword}
                            onChange={(e) => updateSettings({ requireStrongPassword: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-gray-700">Wajib Password Kuat</div>
                            <div className="text-sm text-gray-500">Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pengaturan Fitur</h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.enableNotifications}
                          onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Notifikasi</div>
                          <div className="text-sm text-gray-500">Tampilkan notifikasi untuk update penting</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.enableExport}
                          onChange={(e) => updateSettings({ enableExport: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Export Data</div>
                          <div className="text-sm text-gray-500">Izinkan export data ke Excel/PDF</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.enableAutoBackup}
                          onChange={(e) => updateSettings({ enableAutoBackup: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Auto Backup</div>
                          <div className="text-sm text-gray-500">Backup otomatis data mahasiswa</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.autoArchiveCompletedStudents}
                          onChange={(e) => updateSettings({ autoArchiveCompletedStudents: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Auto Archive</div>
                          <div className="text-sm text-gray-500">Pindahkan mahasiswa yang sudah kompre ke arsip otomatis</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.enableEmailReports}
                          onChange={(e) => updateSettings({ enableEmailReports: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-700">Email Reports</div>
                          <div className="text-sm text-gray-500">Kirim laporan berkala via email</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'display' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pengaturan Tampilan</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tema
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => updateSettings({ theme: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">Terang</option>
                          <option value="dark">Gelap</option>
                          <option value="auto">Otomatis (Sistem)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bahasa
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSettings({ language: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mahasiswa per Halaman
                        </label>
                        <select
                          value={settings.maxStudentsPerPage}
                          onChange={(e) => updateSettings({ maxStudentsPerPage: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urutkan Default
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={settings.defaultSortBy}
                            onChange={(e) => updateSettings({ defaultSortBy: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="name">Nama</option>
                            <option value="nim">NIM</option>
                            <option value="updated_at">Tanggal Update</option>
                            <option value="progress">Progress</option>
                          </select>
                          <select
                            value={settings.defaultSortOrder}
                            onChange={(e) => updateSettings({ defaultSortOrder: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="asc">A-Z / Lama-Baru</option>
                            <option value="desc">Z-A / Baru-Lama</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.showProgressBars}
                            onChange={(e) => updateSettings({ showProgressBars: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-gray-700">Progress Bars</div>
                            <div className="text-sm text-gray-500">Tampilkan progress bar visual</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.enableAnimations}
                            onChange={(e) => updateSettings({ enableAnimations: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-gray-700">Animasi</div>
                            <div className="text-sm text-gray-500">Aktifkan transisi dan animasi UI</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'backup' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Backup & Export</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Format Export Default
                        </label>
                        <select
                          value={settings.exportFormat}
                          onChange={(e) => updateSettings({ exportFormat: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="excel">Excel (.xlsx)</option>
                          <option value="pdf">PDF</option>
                          <option value="both">Excel & PDF</option>
                        </select>
                      </div>

                      {settings.enableAutoBackup && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frekuensi Backup
                          </label>
                          <select
                            value={settings.backupFrequency}
                            onChange={(e) => updateSettings({ backupFrequency: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                          </select>
                        </div>
                      )}

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Kelola Pengaturan</h3>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={exportSettings}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            📥 Export Pengaturan
                          </button>
                          
                          <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                            📤 Import Pengaturan
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImport}
                              className="hidden"
                            />
                          </label>

                          <button
                            onClick={handleReset}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            🔄 Reset ke Default
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Export/import pengaturan untuk backup atau transfer ke server lain
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Advanced Data Management</h2>
                    
                    <DataManagementPanel 
                      onStatusChange={(message, type) => {
                        setSaveMessage(
                          type === 'success' ? `✅ ${message}` :
                          type === 'error' ? `❌ ${message}` :
                          `ℹ️ ${message}`
                        )
                        setTimeout(() => setSaveMessage(''), 5000)
                      }}
                    />
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      💾 Simpan Semua Pengaturan
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      Pengaturan disimpan otomatis saat diubah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
