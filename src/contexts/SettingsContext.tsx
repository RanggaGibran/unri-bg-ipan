'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AppSettings {
  // General
  appName: string
  appDescription: string
  enablePublicStats: boolean
  maintenanceMode: boolean
  
  // Security
  sessionDuration: number // in hours
  requireStrongPassword: boolean
  enableTwoFactor: boolean
  
  // Features
  enableNotifications: boolean
  enableExport: boolean
  enableAutoBackup: boolean
  autoArchiveCompletedStudents: boolean
  enableEmailReports: boolean
  
  // UI/Display
  theme: 'light' | 'dark' | 'auto'
  language: 'id' | 'en'
  maxStudentsPerPage: number
  defaultSortBy: 'name' | 'nim' | 'updated_at' | 'progress'
  defaultSortOrder: 'asc' | 'desc'
  showProgressBars: boolean
  enableAnimations: boolean
  
  // Export/Backup
  exportFormat: 'excel' | 'pdf' | 'both'
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupRetention: number // in days
  
  // Performance
  enableCaching: boolean
  cacheTimeout: number // in minutes
}

const defaultSettings: AppSettings = {
  // General
  appName: 'Progress Ujian Akhir Mahasiswa',
  appDescription: 'Sistem monitoring progress ujian akhir mahasiswa',
  enablePublicStats: true,
  maintenanceMode: false,
  
  // Security
  sessionDuration: 24,
  requireStrongPassword: false,
  enableTwoFactor: false,
  
  // Features
  enableNotifications: true,
  enableExport: true,
  enableAutoBackup: false,
  autoArchiveCompletedStudents: false,
  enableEmailReports: false,
  
  // UI/Display
  theme: 'light',
  language: 'id',
  maxStudentsPerPage: 10,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  showProgressBars: true,
  enableAnimations: true,
  
  // Export/Backup
  exportFormat: 'excel',
  backupFrequency: 'weekly',
  backupRetention: 30,
  
  // Performance
  enableCaching: true,
  cacheTimeout: 5
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetSettings: () => void
  exportSettings: () => void
  importSettings: (settingsData: string) => boolean
  isLoading: boolean
  lastSaved: Date | null
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
        setLastSaved(new Date(parsed._lastSaved || Date.now()))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Save to localStorage
    try {
      localStorage.setItem('appSettings', JSON.stringify({
        ...updatedSettings,
        _lastSaved: new Date().toISOString()
      }))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    try {
      localStorage.removeItem('appSettings')
      setLastSaved(null)
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }

  const exportSettings = () => {
    const exportData = {
      ...settings,
      _exportedAt: new Date().toISOString(),
      _version: '1.0.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `app-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const importSettings = (settingsData: string): boolean => {
    try {
      const importedData = JSON.parse(settingsData)
      
      // Validate imported data structure
      if (typeof importedData !== 'object' || importedData === null) {
        throw new Error('Invalid settings format')
      }

      // Merge with defaults to ensure all properties exist
      const validatedSettings = { ...defaultSettings, ...importedData }
      
      setSettings(validatedSettings)
      
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify({
        ...validatedSettings,
        _lastSaved: new Date().toISOString()
      }))
      
      setLastSaved(new Date())
      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      exportSettings,
      importSettings,
      isLoading,
      lastSaved
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
