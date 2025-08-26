import { supabase } from './supabase'
import { Student } from '@/types/database'

// Types for data management
export interface BackupData {
  version: string
  timestamp: string
  metadata: {
    totalStudents: number
    exportedBy: string
    databaseVersion: string
    applicationVersion: string
  }
  data: {
    students: Student[]
  }
  checksum: string
}

export interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

export interface SyncResult {
  success: boolean
  message: string
  synced?: number
  conflicts?: any[]
}

// Generate checksum for data integrity
function generateChecksum(data: any): string {
  const dataString = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

// Validate student data structure
function validateStudentData(student: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!student.nim || typeof student.nim !== 'string') {
    errors.push('NIM is required and must be a string')
  }
  
  if (!student.name || typeof student.name !== 'string') {
    errors.push('Name is required and must be a string')
  }
  
  // Validate date fields
  const dateFields = ['uj3_date', 'sup_date', 'shp_date', 'uk_date']
  dateFields.forEach(field => {
    if (student[field] && isNaN(Date.parse(student[field]))) {
      errors.push(`${field} must be a valid date`)
    }
  })
  
  return { valid: errors.length === 0, errors }
}

// Create full database backup
export async function createDatabaseBackup(): Promise<BackupData | null> {
  try {
    console.log('🔄 Creating database backup...')
    
    // Get all students data
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching students for backup:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }
    
    const backupData = {
      students: students || []
    }
    
    const backup: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: {
        totalStudents: students?.length || 0,
        exportedBy: 'admin',
        databaseVersion: 'supabase-postgres',
        applicationVersion: '1.0.0'
      },
      data: backupData,
      checksum: generateChecksum(backupData)
    }
    
    console.log(`✅ Backup created: ${backup.metadata.totalStudents} students`)
    return backup
    
  } catch (error) {
    console.error('Error creating backup:', error)
    return null
  }
}

// Export database backup to file
export async function exportDatabaseBackup(): Promise<void> {
  const backup = await createDatabaseBackup()
  
  if (!backup) {
    throw new Error('Failed to create backup')
  }
  
  const fileName = `database-backup-${new Date().toISOString().split('T')[0]}.json`
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  
  URL.revokeObjectURL(url)
  console.log(`📥 Database backup exported: ${fileName}`)
}

// Import and restore database from backup
export async function importDatabaseBackup(file: File): Promise<ImportResult> {
  try {
    console.log('🔄 Importing database backup...')
    
    const fileContent = await file.text()
    const backupData: BackupData = JSON.parse(fileContent)
    
    // Validate backup structure
    if (!backupData.version || !backupData.data || !backupData.checksum) {
      return {
        success: false,
        message: 'Invalid backup file format'
      }
    }
    
    // Verify checksum
    const calculatedChecksum = generateChecksum(backupData.data)
    if (calculatedChecksum !== backupData.checksum) {
      return {
        success: false,
        message: 'Backup file integrity check failed (corrupted data)'
      }
    }
    
    // Validate each student record
    const students = backupData.data.students
    const errors: string[] = []
    
    students.forEach((student, index) => {
      const validation = validateStudentData(student)
      if (!validation.valid) {
        errors.push(`Student ${index + 1}: ${validation.errors.join(', ')}`)
      }
    })
    
    if (errors.length > 0) {
      return {
        success: false,
        message: 'Data validation failed',
        errors: errors.slice(0, 10) // Limit error messages
      }
    }
    
    // Confirm before proceeding
    const proceed = confirm(
      `This will replace all existing data with ${students.length} students from backup.\n` +
      `Backup created: ${new Date(backupData.timestamp).toLocaleString()}\n\n` +
      'Are you sure you want to continue?'
    )
    
    if (!proceed) {
      return {
        success: false,
        message: 'Import cancelled by user'
      }
    }
    
    // Clear existing data and import new data
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (deleteError) {
      throw new Error(`Failed to clear existing data: ${deleteError.message}`)
    }
    
    // Insert new data in batches
    const batchSize = 100
    let importedCount = 0
    
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize)
      
      // Remove id field to let Supabase generate new ones
      const studentsToInsert = batch.map(({ id, ...student }) => student)
      
      const { error: insertError } = await supabase
        .from('students')
        .insert(studentsToInsert)
      
      if (insertError) {
        throw new Error(`Failed to insert batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`)
      }
      
      importedCount += studentsToInsert.length
    }
    
    console.log(`✅ Database import completed: ${importedCount} students`)
    
    return {
      success: true,
      message: `Successfully imported ${importedCount} students from backup`,
      importedCount
    }
    
  } catch (error) {
    console.error('Error importing backup:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Auto backup scheduler
class AutoBackupScheduler {
  private intervalId: NodeJS.Timeout | null = null
  
  start(frequency: 'daily' | 'weekly' | 'monthly') {
    this.stop() // Clear any existing interval
    
    const intervals = {
      daily: 24 * 60 * 60 * 1000,    // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000,  // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000  // 30 days
    }
    
    const interval = intervals[frequency]
    
    this.intervalId = setInterval(async () => {
      try {
        console.log('🔄 Running auto backup...')
        const backup = await createDatabaseBackup()
        
        if (backup) {
          // Store backup in localStorage for later download
          const backupKey = `autoBackup_${Date.now()}`
          localStorage.setItem(backupKey, JSON.stringify(backup))
          
          // Clean old auto backups (keep last 5)
          const autoBackupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('autoBackup_'))
            .sort()
          
          if (autoBackupKeys.length > 5) {
            const keysToRemove = autoBackupKeys.slice(0, autoBackupKeys.length - 5)
            keysToRemove.forEach(key => localStorage.removeItem(key))
          }
          
          console.log('✅ Auto backup completed and stored')
        }
      } catch (error) {
        console.error('❌ Auto backup failed:', error)
      }
    }, interval)
    
    console.log(`📅 Auto backup scheduled: ${frequency}`)
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('🛑 Auto backup stopped')
    }
  }
  
  getStoredBackups(): Array<{ key: string; backup: BackupData }> {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('autoBackup_'))
      .map(key => ({
        key,
        backup: JSON.parse(localStorage.getItem(key) || '{}')
      }))
      .sort((a, b) => new Date(b.backup.timestamp).getTime() - new Date(a.backup.timestamp).getTime())
  }
  
  downloadStoredBackup(key: string) {
    const backupData = localStorage.getItem(key)
    if (!backupData) return
    
    const backup: BackupData = JSON.parse(backupData)
    const fileName = `auto-backup-${backup.timestamp.split('T')[0]}.json`
    const dataBlob = new Blob([backupData], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    
    URL.revokeObjectURL(url)
  }
}

export const autoBackupScheduler = new AutoBackupScheduler()

// Data synchronization with external systems
export async function syncWithExternalSystem(config: {
  apiUrl: string
  apiKey?: string
  syncDirection: 'import' | 'export' | 'bidirectional'
}): Promise<SyncResult> {
  try {
    console.log('🔄 Starting data synchronization...')
    
    const syncHistory = getSyncHistory()
    const syncStartTime = new Date()
    let syncedCount = 0
    const conflicts: any[] = []
    
    // Test connection first
    const connectionTest = await testConnection(config.apiUrl, config.apiKey)
    if (!connectionTest.success) {
      throw new Error(`Connection test failed: ${connectionTest.message}`)
    }
    
    if (config.syncDirection === 'export' || config.syncDirection === 'bidirectional') {
      console.log('📤 Exporting local data to external system...')
      
      // Export local data to external system
      const backup = await createDatabaseBackup()
      if (!backup) {
        throw new Error('Failed to create backup for sync')
      }
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(`${config.apiUrl}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          'X-Sync-Source': 'Progress-Ujian-Mahasiswa',
          'X-Sync-Version': '1.0.0'
        },
        body: JSON.stringify(backup),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Export failed: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const exportResult = await response.json()
      syncedCount += exportResult.imported || backup.metadata.totalStudents
    }
    
    if (config.syncDirection === 'import' || config.syncDirection === 'bidirectional') {
      console.log('📥 Importing data from external system...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`${config.apiUrl}/export`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          'X-Sync-Source': 'Progress-Ujian-Mahasiswa'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Import failed: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const externalData = await response.json()
      const importResult = await importExternalData(externalData)
      
      syncedCount += importResult.imported
      conflicts.push(...importResult.conflicts)
    }
    
    // Record sync history
    const syncRecord = {
      id: generateSyncId(),
      timestamp: syncStartTime.toISOString(),
      direction: config.syncDirection,
      apiUrl: maskApiUrl(config.apiUrl),
      status: 'success',
      syncedCount,
      conflicts: conflicts.length,
      duration: Date.now() - syncStartTime.getTime()
    }
    
    syncHistory.push(syncRecord)
    saveSyncHistory(syncHistory.slice(-20)) // Keep last 20 sync records
    
    // Store last sync time
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastSyncTime', syncStartTime.toISOString())
    }
    
    return {
      success: true,
      message: `Data synchronization completed successfully. Synced: ${syncedCount} records`,
      synced: syncedCount,
      conflicts
    }
    
  } catch (error) {
    console.error('Sync error:', error)
    
    // Record failed sync
    const syncHistory = getSyncHistory()
    const syncRecord = {
      id: generateSyncId(),
      timestamp: new Date().toISOString(),
      direction: config.syncDirection,
      apiUrl: maskApiUrl(config.apiUrl),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      syncedCount: 0,
      conflicts: 0,
      duration: 0
    }
    
    syncHistory.push(syncRecord)
    saveSyncHistory(syncHistory.slice(-20))
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed'
    }
  }
}

// Export students data to Excel/CSV format
export async function exportStudentsToExcel(): Promise<void> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch students: ${error.message}`)
    }
    
    if (!students || students.length === 0) {
      throw new Error('No students data to export')
    }
    
    // Convert to CSV format
    const headers = [
      'NIM', 'Nama', 'Judul Proposal', 'Izin Penelitian',
      'Tanggal UJ3', 'Pembimbing 1', 'Pembimbing 2',
      'Tanggal SUP', 'SUP Pembimbing 1', 'SUP Pembimbing 2', 'SUP Penguji 1', 'SUP Penguji 2',
      'Tanggal SHP', 'SHP Pembimbing 1', 'SHP Pembimbing 2', 'SHP Penguji 1', 'SHP Penguji 2',
      'Tanggal UK', 'UK Penguji 1', 'UK Penguji 2', 'UK Penguji 3', 'UK Penguji 4',
      'Status Kompre', 'Tanggal Dibuat', 'Tanggal Diupdate'
    ]
    
    const csvContent = [
      headers.join(','),
      ...students.map((student: Student) => [
        student.nim || '',
        student.name || '',
        student.thesis_title || '',
        student.research_permit || '',
        student.uj3_date || '',
        student.supervisor_1 || '',
        student.supervisor_2 || '',
        student.sup_date || '',
        student.sup_supervisor_1 || '',
        student.sup_supervisor_2 || '',
        student.sup_examiner_1 || '',
        student.sup_examiner_2 || '',
        student.shp_date || '',
        student.shp_supervisor_1 || '',
        student.shp_supervisor_2 || '',
        student.shp_examiner_1 || '',
        student.shp_examiner_2 || '',
        student.uk_date || '',
        student.uk_examiner_1 || '',
        student.uk_examiner_2 || '',
        student.uk_examiner_3 || '',
        student.uk_examiner_4 || '',
        student.is_completed ? 'Selesai' : 'Dalam Progress',
        student.created_at || '',
        student.updated_at || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    // Add BOM for proper Excel UTF-8 handling
    const bom = '\uFEFF'
    const fileName = `data-mahasiswa-${new Date().toISOString().split('T')[0]}.csv`
    const dataBlob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    
    URL.revokeObjectURL(url)
    console.log(`📊 Students data exported to Excel: ${fileName}`)
    
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

// Clean up old backups and temporary data
export function cleanupTempData(): void {
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('temp_') ||
        key.startsWith('cache_') ||
        (key.startsWith('autoBackup_') && isOldBackup(key))
      )) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🧹 Cleaned up ${keysToRemove.length} temporary items`)
    
  } catch (error) {
    console.error('Error cleaning up temp data:', error)
  }
}

function isOldBackup(key: string): boolean {
  try {
    const backup = JSON.parse(localStorage.getItem(key) || '{}')
    const backupDate = new Date(backup.timestamp)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return backupDate < thirtyDaysAgo
  } catch {
    return true // Remove invalid backups
  }
}

// Advanced data management helper functions

// Generate unique sync ID
function generateSyncId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Mask sensitive API URL for logging
function maskApiUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`
  } catch {
    return url.replace(/[?&]api_key=[^&]+/gi, '?api_key=***')
  }
}

// Test connection to external API
async function testConnection(apiUrl: string, apiKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    return {
      success: response.ok,
      message: response.ok ? 'Connection successful' : `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

// Transform data for different external systems
function transformDataForExternalSystem(backup: BackupData, systemType: string) {
  switch (systemType.toLowerCase()) {
    case 'siakad':
      return transformForSiakad(backup)
    case 'feeder':
      return transformForFeeder(backup)
    default:
      return backup // Return as-is for custom APIs
  }
}

// Transform data from external systems
function transformDataFromExternalSystem(data: any, systemType: string) {
  switch (systemType.toLowerCase()) {
    case 'siakad':
      return transformFromSiakad(data)
    case 'feeder':
      return transformFromFeeder(data)
    default:
      return data // Return as-is for custom APIs
  }
}

// SIAKAD transformation functions
function transformForSiakad(backup: BackupData) {
  return {
    version: backup.version,
    mahasiswa: backup.data.students.map(student => ({
      nim: student.nim,
      nama: student.name,
      judul_proposal: student.thesis_title,
      status_kompre: student.is_completed,
      tanggal_uj3: student.uj3_date,
      tanggal_sup: student.sup_date,
      tanggal_shp: student.shp_date,
      tanggal_uk: student.uk_date
    }))
  }
}

function transformFromSiakad(data: any) {
  return {
    students: data.mahasiswa?.map((mhs: any) => ({
      nim: mhs.nim,
      name: mhs.nama,
      thesis_title: mhs.judul_proposal,
      is_completed: mhs.status_kompre,
      uj3_date: mhs.tanggal_uj3,
      sup_date: mhs.tanggal_sup,
      shp_date: mhs.tanggal_shp,
      uk_date: mhs.tanggal_uk
    })) || []
  }
}

// FEEDER transformation functions
function transformForFeeder(backup: BackupData) {
  return {
    data_mahasiswa: backup.data.students.map(student => ({
      nim_mahasiswa: student.nim,
      nama_mahasiswa: student.name,
      judul_tugas_akhir: student.thesis_title,
      status_kelulusan: student.is_completed ? 'LULUS' : 'AKTIF'
    }))
  }
}

function transformFromFeeder(data: any) {
  return {
    students: data.data_mahasiswa?.map((mhs: any) => ({
      nim: mhs.nim_mahasiswa,
      name: mhs.nama_mahasiswa,
      thesis_title: mhs.judul_tugas_akhir,
      is_completed: mhs.status_kelulusan === 'LULUS'
    })) || []
  }
}

// Import external data with conflict resolution
async function importExternalData(data: any): Promise<{ imported: number; conflicts: any[] }> {
  const conflicts: any[] = []
  let imported = 0
  
  if (!data.students || !Array.isArray(data.students)) {
    throw new Error('Invalid external data format')
  }
  
  for (const externalStudent of data.students) {
    try {
      // Check if student already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('*')
        .eq('nim', externalStudent.nim)
        .single()
      
      if (existingStudent) {
        // Handle conflict - compare timestamps or let user decide
        const conflict = {
          nim: externalStudent.nim,
          local: existingStudent,
          external: externalStudent,
          type: 'duplicate'
        }
        conflicts.push(conflict)
        
        // For now, skip duplicates (can be enhanced with merge strategies)
        continue
      }
      
      // Insert new student
      const { error } = await supabase
        .from('students')
        .insert([externalStudent])
      
      if (error) {
        conflicts.push({
          nim: externalStudent.nim,
          error: error.message,
          type: 'insert_error'
        })
      } else {
        imported++
      }
      
    } catch (error) {
      conflicts.push({
        nim: externalStudent.nim,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'process_error'
      })
    }
  }
  
  return { imported, conflicts }
}

// Sync history management
function getSyncHistory(): any[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const history = localStorage.getItem('syncHistory')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error reading sync history:', error)
    return []
  }
}

function saveSyncHistory(history: any[]): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem('syncHistory', JSON.stringify(history))
  } catch (error) {
    console.error('Error saving sync history:', error)
  }
}

// Data validation and integrity checks
export async function validateDatabaseIntegrity(): Promise<{
  valid: boolean
  issues: string[]
  statistics: any
}> {
  const issues: string[] = []
  
  try {
    // Get all students
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
    
    if (error) {
      issues.push(`Database query error: ${error.message}`)
      return { valid: false, issues, statistics: {} }
    }
    
    if (!students) {
      return { valid: true, issues: [], statistics: { totalStudents: 0 } }
    }
    
    // Check for data integrity issues
    const duplicateNims = findDuplicateNims(students)
    if (duplicateNims.length > 0) {
      issues.push(`Duplicate NIMs found: ${duplicateNims.join(', ')}`)
    }
    
    const invalidDates = findInvalidDates(students)
    if (invalidDates.length > 0) {
      issues.push(`Invalid dates found in ${invalidDates.length} records`)
    }
    
    const orphanedData = findOrphanedData(students)
    if (orphanedData.length > 0) {
      issues.push(`Orphaned data found in ${orphanedData.length} records`)
    }
    
    // Generate statistics
    const statistics = {
      totalStudents: students.length,
      completedStudents: students.filter((s: Student) => s.is_completed).length,
      studentsWithUj3: students.filter((s: Student) => s.uj3_date).length,
      studentsWithSup: students.filter((s: Student) => s.sup_date).length,
      studentsWithShp: students.filter((s: Student) => s.shp_date).length,
      studentsWithUk: students.filter((s: Student) => s.uk_date).length,
      duplicates: duplicateNims.length,
      invalidDates: invalidDates.length,
      orphanedRecords: orphanedData.length
    }
    
    return {
      valid: issues.length === 0,
      issues,
      statistics
    }
    
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { valid: false, issues, statistics: {} }
  }
}

// Helper functions for data validation
function findDuplicateNims(students: Student[]): string[] {
  const nimCounts = new Map<string, number>()
  
  students.forEach(student => {
    if (student.nim) {
      nimCounts.set(student.nim, (nimCounts.get(student.nim) || 0) + 1)
    }
  })
  
  return Array.from(nimCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([nim, _]) => nim)
}

function findInvalidDates(students: Student[]): string[] {
  const issues: string[] = []
  
  students.forEach(student => {
    const dateFields = ['uj3_date', 'sup_date', 'shp_date', 'uk_date', 'created_at', 'updated_at']
    
    dateFields.forEach(field => {
      const dateValue = (student as any)[field]
      if (dateValue && isNaN(Date.parse(dateValue))) {
        issues.push(`${student.nim || 'Unknown'}: Invalid ${field}`)
      }
    })
  })
  
  return issues
}

function findOrphanedData(students: Student[]): string[] {
  const orphaned: string[] = []
  
  students.forEach(student => {
    // Check for logical inconsistencies
    if (student.uk_date && !student.shp_date) {
      orphaned.push(`${student.nim}: UK completed but no SHP date`)
    }
    
    if (student.shp_date && !student.sup_date) {
      orphaned.push(`${student.nim}: SHP completed but no SUP date`)
    }
    
    if (student.sup_date && !student.uj3_date) {
      orphaned.push(`${student.nim}: SUP completed but no UJ3 date`)
    }
    
    if (student.is_completed && !student.uk_date) {
      orphaned.push(`${student.nim}: Marked as completed but no UK date`)
    }
  })
  
  return orphaned
}

// Data repair functions
export async function repairDatabaseIssues(issues: string[]): Promise<{
  success: boolean
  repaired: string[]
  failed: string[]
}> {
  const repaired: string[] = []
  const failed: string[] = []
  
  for (const issue of issues) {
    try {
      if (issue.includes('Duplicate NIMs')) {
        // Handle duplicate NIMs - this is complex and might need manual intervention
        failed.push(`${issue} - Requires manual intervention`)
        continue
      }
      
      if (issue.includes('Invalid dates')) {
        // Could attempt to fix common date format issues
        const fixResult = await fixInvalidDates()
        if (fixResult.success) {
          repaired.push(`Fixed ${fixResult.count} invalid dates`)
        } else {
          failed.push(issue)
        }
        continue
      }
      
      // Add more repair logic as needed
      failed.push(`${issue} - No automatic repair available`)
      
    } catch (error) {
      failed.push(`${issue} - Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return {
    success: repaired.length > 0,
    repaired,
    failed
  }
}

async function fixInvalidDates(): Promise<{ success: boolean; count: number }> {
  // This is a placeholder for date repair logic
  // Implementation would depend on specific date format issues found
  return { success: false, count: 0 }
}

// Database optimization and maintenance
export async function optimizeDatabase(): Promise<{
  success: boolean
  message: string
  actions: string[]
}> {
  const actions: string[] = []
  
  try {
    // Clean up old backup records from localStorage
    if (typeof localStorage !== 'undefined') {
      const cleaned = cleanupOldBackups()
      if (cleaned > 0) {
        actions.push(`Cleaned up ${cleaned} old backup records`)
      }
    }
    
    // Vacuum/analyze database (PostgreSQL specific)
    // Note: This might require elevated permissions in Supabase
    try {
      await supabase.rpc('analyze_tables') // Custom function if available
      actions.push('Database statistics updated')
    } catch (error) {
      // Ignore if function doesn't exist
      console.log('Database analyze not available:', error)
    }
    
    // Update search indexes if needed
    // This is implementation-specific
    
    return {
      success: true,
      message: `Database optimization completed. ${actions.length} actions performed.`,
      actions
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions
    }
  }
}

function cleanupOldBackups(): number {
  try {
    const keys = Object.keys(localStorage)
    const backupKeys = keys.filter(key => key.startsWith('autoBackup_'))
    
    if (backupKeys.length > 10) {
      // Keep only the 10 most recent
      const sortedKeys = backupKeys.sort().slice(0, -10)
      sortedKeys.forEach(key => localStorage.removeItem(key))
      return sortedKeys.length
    }
    
    return 0
  } catch (error) {
    console.error('Error cleaning up old backups:', error)
    return 0
  }
}
