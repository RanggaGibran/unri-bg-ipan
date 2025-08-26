'use client'

import { useState, useEffect } from 'react'
import { 
  exportDatabaseBackup, 
  importDatabaseBackup, 
  exportStudentsToExcel,
  autoBackupScheduler,
  cleanupTempData,
  syncWithExternalSystem,
  validateDatabaseIntegrity,
  repairDatabaseIssues,
  optimizeDatabase
} from '@/lib/dataManagement'
import { useSettings } from '@/contexts/SettingsContext'

interface DataManagementPanelProps {
  onStatusChange?: (message: string, type: 'success' | 'error' | 'info') => void
}

interface ValidationResult {
  valid: boolean
  issues: string[]
  statistics: any
}

interface SyncConfig {
  apiUrl: string
  apiKey: string
  syncDirection: 'import' | 'export' | 'bidirectional'
  systemType: string
}

export default function DataManagementPanel({ onStatusChange }: DataManagementPanelProps) {
  const { settings, updateSettings } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [activeOperation, setActiveOperation] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    apiUrl: '',
    apiKey: '',
    syncDirection: 'export',
    systemType: 'Custom API'
  })
  const [showSyncConfig, setShowSyncConfig] = useState(false)
  const [showValidationDetails, setShowValidationDetails] = useState(false)

  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onStatusChange) {
      onStatusChange(message, type)
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }

  // Backup Operations
  const handleCreateBackup = async () => {
    setIsLoading(true)
    setActiveOperation('backup')
    
    try {
      await exportDatabaseBackup()
      showStatus('✅ Database backup berhasil dibuat dan didownload!', 'success')
    } catch (error) {
      console.error('Backup error:', error)
      showStatus('❌ Gagal membuat backup database', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setActiveOperation('restore')

    try {
      const result = await importDatabaseBackup(file)
      
      if (result.success) {
        showStatus(`✅ ${result.message}`, 'success')
      } else {
        showStatus(`❌ ${result.message}`, 'error')
        if (result.errors) {
          console.error('Import errors:', result.errors)
        }
      }
    } catch (error) {
      console.error('Restore error:', error)
      showStatus('❌ Gagal restore backup database', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // Export Operations
  const handleExportData = async (format: 'excel' | 'json') => {
    setIsLoading(true)
    setActiveOperation(`export-${format}`)

    try {
      if (format === 'excel') {
        await exportStudentsToExcel()
        showStatus('✅ Data mahasiswa berhasil diexport ke Excel!', 'success')
      } else if (format === 'json') {
        const response = await fetch('/api/data/export?format=json')
        const result = await response.json()
        
        if (result.success) {
          // Download JSON file
          const fileName = `data-mahasiswa-${new Date().toISOString().split('T')[0]}.json`
          const dataBlob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
          
          const url = URL.createObjectURL(dataBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.click()
          URL.revokeObjectURL(url)
          
          showStatus(`✅ Data mahasiswa berhasil diexport ke JSON (${result.count} records)!`, 'success')
        } else {
          throw new Error('Export failed')
        }
      }
    } catch (error) {
      console.error('Export error:', error)
      showStatus(`❌ Gagal export data ke ${format.toUpperCase()}`, 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  // Auto Backup Operations
  const handleToggleAutoBackup = (enabled: boolean) => {
    updateSettings({ enableAutoBackup: enabled })
    
    if (enabled) {
      autoBackupScheduler.start(settings.backupFrequency)
      showStatus('✅ Auto backup diaktifkan', 'success')
    } else {
      autoBackupScheduler.stop()
      showStatus('ℹ️ Auto backup dinonaktifkan', 'info')
    }
  }

  const handleBackupFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    updateSettings({ backupFrequency: frequency })
    
    if (settings.enableAutoBackup) {
      autoBackupScheduler.start(frequency)
      showStatus(`✅ Frekuensi auto backup diubah ke ${frequency}`, 'success')
    }
  }

  // Sync Operations
  const handleSyncData = async () => {
    if (!syncConfig.apiUrl.trim()) {
      showStatus('❌ URL API tidak boleh kosong', 'error')
      return
    }

    const confirmed = confirm(
      `Apakah Anda yakin ingin melakukan sinkronisasi ${syncConfig.syncDirection} dengan ${syncConfig.systemType}?`
    )

    if (!confirmed) return

    setIsLoading(true)
    setActiveOperation('sync')

    try {
      const result = await syncWithExternalSystem({
        apiUrl: syncConfig.apiUrl,
        apiKey: syncConfig.apiKey || undefined,
        syncDirection: syncConfig.syncDirection
      })

      if (result.success) {
        showStatus(`✅ ${result.message}`, 'success')
        if (result.conflicts && result.conflicts.length > 0) {
          showStatus(`⚠️ ${result.conflicts.length} conflicts detected during sync`, 'info')
        }
        localStorage.setItem('lastSyncTime', new Date().toISOString())
      } else {
        showStatus(`❌ ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Sync error:', error)
      showStatus('❌ Gagal sinkronisasi data', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  // Cleanup Operations
  const handleCleanupData = () => {
    try {
      cleanupTempData()
      showStatus('✅ Data temporary berhasil dibersihkan', 'success')
    } catch (error) {
      console.error('Cleanup error:', error)
      showStatus('❌ Gagal membersihkan data temporary', 'error')
    }
  }

  // Database Validation Operations
  const handleValidateDatabase = async () => {
    setIsLoading(true)
    setActiveOperation('validate')

    try {
      const result = await validateDatabaseIntegrity()
      setValidationResult(result)
      
      if (result.valid) {
        showStatus('✅ Database validation completed - No issues found!', 'success')
      } else {
        showStatus(`⚠️ Database validation found ${result.issues.length} issues`, 'error')
      }
    } catch (error) {
      console.error('Validation error:', error)
      showStatus('❌ Database validation failed', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  const handleRepairDatabase = async () => {
    if (!validationResult || validationResult.issues.length === 0) {
      showStatus('❌ No issues to repair', 'error')
      return
    }

    const confirmed = confirm(
      `This will attempt to repair ${validationResult.issues.length} database issues. ` +
      'Some repairs may require manual intervention. Continue?'
    )

    if (!confirmed) return

    setIsLoading(true)
    setActiveOperation('repair')

    try {
      const result = await repairDatabaseIssues(validationResult.issues)
      
      if (result.success) {
        showStatus(`✅ Repaired ${result.repaired.length} issues`, 'success')
        // Re-validate after repair
        await handleValidateDatabase()
      } else {
        showStatus(`⚠️ ${result.failed.length} issues could not be repaired automatically`, 'error')
      }
    } catch (error) {
      console.error('Repair error:', error)
      showStatus('❌ Database repair failed', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  const handleOptimizeDatabase = async () => {
    setIsLoading(true)
    setActiveOperation('optimize')

    try {
      const result = await optimizeDatabase()
      
      if (result.success) {
        showStatus(`✅ ${result.message}`, 'success')
      } else {
        showStatus(`❌ ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      showStatus('❌ Database optimization failed', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  // Enhanced Sync Operations
  const handleTestConnection = async () => {
    if (!syncConfig.apiUrl.trim()) {
      showStatus('❌ API URL tidak boleh kosong', 'error')
      return
    }

    setIsLoading(true)
    setActiveOperation('test-connection')

    try {
      const response = await fetch(`/api/data/sync?action=test&apiUrl=${encodeURIComponent(syncConfig.apiUrl)}`)
      const result = await response.json()
      
      if (result.success) {
        showStatus(`✅ Connection successful (${result.responseTime}ms)`, 'success')
      } else {
        showStatus(`❌ Connection failed: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Connection test error:', error)
      showStatus('❌ Connection test failed', 'error')
    } finally {
      setIsLoading(false)
      setActiveOperation(null)
    }
  }

  // Get stored auto backups
  const storedBackups = autoBackupScheduler.getStoredBackups()

  return (
    <div className="space-y-8">
      {/* Backup & Restore Section */}
      <div className="bg-gray-700/30 rounded-lg shadow-sm border border-gray-600/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          💾 Backup & Restore Database
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-200 mb-2">Create Backup</h4>
              <button
                onClick={handleCreateBackup}
                disabled={isLoading && activeOperation === 'backup'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && activeOperation === 'backup' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat Backup...
                  </span>
                ) : (
                  '📥 Buat Backup'
                )}
              </button>
              <p className="text-sm text-gray-500 mt-1">
                Download backup lengkap database dalam format JSON
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Restore Backup</h4>
              <label className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer block text-center">
                {isLoading && activeOperation === 'restore' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  '📤 Restore Backup'
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Upload file backup JSON untuk restore data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Backup Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          🔄 Auto Backup
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableAutoBackup}
              onChange={(e) => handleToggleAutoBackup(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-700">Enable Auto Backup</div>
              <div className="text-sm text-gray-500">Backup otomatis database secara berkala</div>
            </div>
          </label>

          {settings.enableAutoBackup && (
            <div className="ml-7 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frekuensi Backup
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleBackupFrequencyChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>

              {storedBackups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stored Auto Backups ({storedBackups.length})
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {storedBackups.map(({ key, backup }, index) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{new Date(backup.timestamp).toLocaleString()}</span>
                        <span className="text-gray-500">{backup.metadata.totalStudents} students</span>
                        <button
                          onClick={() => autoBackupScheduler.downloadStoredBackup(key)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Data Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          📊 Export Data
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportData('excel')}
            disabled={isLoading && activeOperation === 'export-excel'}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && activeOperation === 'export-excel' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                📈 Export ke Excel
                <div className="text-sm opacity-90 mt-1">Format CSV untuk spreadsheet</div>
              </>
            )}
          </button>

          <button
            onClick={() => handleExportData('json')}
            disabled={isLoading && activeOperation === 'export-json'}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && activeOperation === 'export-json' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                🔧 Export ke JSON
                <div className="text-sm opacity-90 mt-1">Format JSON untuk integrasi</div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Database Validation & Maintenance Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          🔍 Database Validation & Maintenance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleValidateDatabase}
            disabled={isLoading && activeOperation === 'validate'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && activeOperation === 'validate' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memvalidasi...
              </span>
            ) : (
              '🔍 Validasi Database'
            )}
          </button>

          <button
            onClick={handleRepairDatabase}
            disabled={isLoading || !validationResult || validationResult.issues.length === 0}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && activeOperation === 'repair' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memperbaiki...
              </span>
            ) : (
              '🔧 Perbaiki Issues'
            )}
          </button>

          <button
            onClick={handleOptimizeDatabase}
            disabled={isLoading && activeOperation === 'optimize'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && activeOperation === 'optimize' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengoptimasi...
              </span>
            ) : (
              '⚡ Optimasi Database'
            )}
          </button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                Hasil Validasi Database
              </h4>
              <button
                onClick={() => setShowValidationDetails(!showValidationDetails)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showValidationDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
              </button>
            </div>

            <div className={`p-3 rounded-lg ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <span className={`text-2xl mr-2 ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.valid ? '✅' : '❌'}
                </span>
                <div>
                  <div className={`font-medium ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {validationResult.valid ? 'Database Valid' : `${validationResult.issues.length} Issues Found`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {validationResult.statistics.totalStudents} total students analyzed
                  </div>
                </div>
              </div>
            </div>

            {showValidationDetails && (
              <div className="mt-4 space-y-4">
                {/* Statistics */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">📊 Database Statistics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">Total Students</div>
                      <div className="text-blue-600">{validationResult.statistics.totalStudents}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">Completed</div>
                      <div className="text-green-600">{validationResult.statistics.completedStudents}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">UJ3 Done</div>
                      <div className="text-blue-600">{validationResult.statistics.studentsWithUj3}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">UK Done</div>
                      <div className="text-purple-600">{validationResult.statistics.studentsWithUk}</div>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {validationResult.issues.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">⚠️ Issues Found</h5>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                        {validationResult.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Synchronization Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          🔄 Data Synchronization
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Sinkronisasi data dengan sistem eksternal (SIAKAD, FEEDER, etc.)
            </p>
            <button
              onClick={() => setShowSyncConfig(!showSyncConfig)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showSyncConfig ? 'Sembunyikan Config' : 'Konfigurasi Sync'}
            </button>
          </div>

          {showSyncConfig && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API URL
                  </label>
                  <input
                    type="url"
                    value={syncConfig.apiUrl}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                    placeholder="https://api.siakad.ac.id/v1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={syncConfig.apiKey}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Your API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Type
                  </label>
                  <select
                    value={syncConfig.systemType}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, systemType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Custom API">Custom API</option>
                    <option value="SIAKAD">SIAKAD</option>
                    <option value="FEEDER">FEEDER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sync Direction
                  </label>
                  <select
                    value={syncConfig.syncDirection}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, syncDirection: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="export">Export to External</option>
                    <option value="import">Import from External</option>
                    <option value="bidirectional">Bidirectional Sync</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isLoading && activeOperation === 'test-connection'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && activeOperation === 'test-connection' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </span>
                  ) : (
                    '🔗 Test Connection'
                  )}
                </button>

                <button
                  onClick={handleSyncData}
                  disabled={isLoading && activeOperation === 'sync'}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && activeOperation === 'sync' ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing...
                    </span>
                  ) : (
                    '🔄 Start Sync'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          🧹 Data Maintenance
        </h3>
        
        <div className="space-y-4">
          <button
            onClick={handleCleanupData}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            🗑️ Cleanup Temporary Data
          </button>
          <p className="text-sm text-gray-500">
            Hapus file temporary, cache, dan backup lama yang tidak terpakai
          </p>
        </div>
      </div>
    </div>
  )
}
