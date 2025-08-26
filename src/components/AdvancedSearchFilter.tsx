'use client'

import { useState, useEffect, useMemo } from 'react'
import { Student } from '@/types/database'

interface FilterConfig {
  searchFields: string[]
  enableStageFilter: boolean
  enableDateFilter: boolean
  enableProgressFilter: boolean
  enableYearFilter: boolean
  enableProgramStudiFilter: boolean
  dateField: string
}

interface AdvancedSearchFilterProps {
  students: Student[]
  onFilteredStudentsChange: (filtered: Student[]) => void
  config: FilterConfig
  title?: string
}

interface QuickDateFilter {
  label: string
  value: string
  days?: number
}

const QUICK_DATE_FILTERS: QuickDateFilter[] = [
  { label: 'Semua', value: 'all' },
  { label: '7 hari terakhir', value: '7days', days: 7 },
  { label: '30 hari terakhir', value: '30days', days: 30 },
  { label: '3 bulan terakhir', value: '3months', days: 90 },
  { label: '6 bulan terakhir', value: '6months', days: 180 },
  { label: '1 tahun terakhir', value: '1year', days: 365 }
]

const STAGE_OPTIONS = [
  { label: 'Semua Tahapan', value: 'all' },
  { label: 'Surat Tugas (UJ3)', value: 'uj3' },
  { label: 'SUP', value: 'sup' },
  { label: 'SHP', value: 'shp' },
  { label: 'UK (Kompre)', value: 'uk' }
]

const PROGRESS_OPTIONS = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Dalam Proses', value: 'in_progress' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Tertunda', value: 'pending' }
]

export default function AdvancedSearchFilter({
  students,
  onFilteredStudentsChange,
  config,
  title = '🔍 Pencarian & Filter Mahasiswa'
}: AdvancedSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('all')
  const [selectedProgress, setSelectedProgress] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedProgramStudi, setSelectedProgramStudi] = useState('all')
  const [quickDateFilter, setQuickDateFilter] = useState('all')
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  })
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique years from students' NIMs (first 2 digits)
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    students.forEach(student => {
      if (student.nim && student.nim.length >= 2) {
        const year = student.nim.substring(0, 2)
        // Convert 2-digit year to full year (assuming 20xx for modern years)
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
        years.add(fullYear)
      }
    })
    return Array.from(years).sort().reverse() // Most recent years first
  }, [students])

  // Get unique program studi from students
  const availableProgramStudi = useMemo(() => {
    const programStudiSet = new Set<string>()
    students.forEach(student => {
      if (student.program_studi && student.program_studi.trim() !== '') {
        programStudiSet.add(student.program_studi)
      }
    })
    return Array.from(programStudiSet).sort()
  }, [students])

  const yearOptions = [
    { label: 'Semua Angkatan', value: 'all' },
    ...availableYears.map(year => ({
      label: `Angkatan ${year}`,
      value: year
    }))
  ]

  const programStudiOptions = [
    { label: 'Semua Program Studi', value: 'all' },
    ...availableProgramStudi.map(prodi => ({
      label: prodi,
      value: prodi
    }))
  ]

  // Filter students based on all criteria
  const filteredStudents = useMemo(() => {
    let filtered = [...students]

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(student => 
        config.searchFields.some(field => {
          const value = student[field as keyof Student]
          return value && String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Year filter (based on first 2 digits of NIM)
    if (config.enableYearFilter && selectedYear !== 'all') {
      filtered = filtered.filter(student => {
        if (!student.nim || student.nim.length < 2) return false
        const year = student.nim.substring(0, 2)
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
        return fullYear === selectedYear
      })
    }

    // Program Studi filter
    if (config.enableProgramStudiFilter && selectedProgramStudi !== 'all') {
      filtered = filtered.filter(student => {
        return student.program_studi === selectedProgramStudi
      })
    }

    // Stage filter (show only students up to and including the selected stage)
    if (config.enableStageFilter && selectedStage !== 'all') {
      const stageOrder = ['uj3', 'sup', 'shp', 'uk']
      const selectedIdx = stageOrder.indexOf(selectedStage)
      filtered = filtered.filter(student => {
        // Determine the highest completed stage for this student
        let completedIdx = -1
        if (student.uk_date) completedIdx = 3
        else if (student.shp_date) completedIdx = 2
        else if (student.sup_date) completedIdx = 1
        else if (student.uj3_date) completedIdx = 0
        // Only show students whose highest completed stage is <= selectedIdx
        return completedIdx <= selectedIdx && completedIdx >= 0
      })
    }

    // Progress filter
    if (config.enableProgressFilter && selectedProgress !== 'all') {
      filtered = filtered.filter(student => {
        const hasUj3 = Boolean(student.uj3_date)
        const hasSup = Boolean(student.sup_date)
        const hasShp = Boolean(student.shp_date)
        const hasUk = Boolean(student.uk_date)

        switch (selectedProgress) {
          case 'completed':
            return hasUj3 && hasSup && hasShp && hasUk
          case 'in_progress':
            return (hasUj3 || hasSup || hasShp) && !hasUk
          case 'pending':
            return !hasUj3 && !hasSup && !hasShp && !hasUk
          default:
            return true
        }
      })
    }

    // Date filter
    if (config.enableDateFilter && config.dateField) {
      if (quickDateFilter !== 'all') {
        const quickFilter = QUICK_DATE_FILTERS.find(f => f.value === quickDateFilter)
        if (quickFilter && quickFilter.days) {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - quickFilter.days)
          
          filtered = filtered.filter(student => {
            const dateValue = student[config.dateField as keyof Student]
            if (!dateValue) return false
            const studentDate = new Date(String(dateValue))
            return studentDate >= cutoffDate
          })
        }
      } else if (customDateRange.start || customDateRange.end) {
        filtered = filtered.filter(student => {
          const dateValue = student[config.dateField as keyof Student]
          if (!dateValue) return false
          
          const studentDate = new Date(String(dateValue))
          
          if (customDateRange.start) {
            const startDate = new Date(customDateRange.start)
            if (studentDate < startDate) return false
          }
          
          if (customDateRange.end) {
            const endDate = new Date(customDateRange.end)
            if (studentDate > endDate) return false
          }
          
          return true
        })
      }
    }

    return filtered
  }, [
    students, 
    searchTerm, 
    selectedYear, 
    selectedProgramStudi, 
    selectedStage, 
    selectedProgress, 
    quickDateFilter, 
    customDateRange,
    config.searchFields,
    config.enableYearFilter,
    config.enableProgramStudiFilter,
    config.enableStageFilter,
    config.enableProgressFilter,
    config.enableDateFilter,
    config.dateField
  ])

  // Update parent component when filtered results change
  useEffect(() => {
    onFilteredStudentsChange(filteredStudents)
  }, [filteredStudents])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStage('all')
    setSelectedProgress('all')
    setSelectedYear('all')
    setSelectedProgramStudi('all')
    setQuickDateFilter('all')
    setCustomDateRange({ start: '', end: '' })
  }

  const hasActiveFilters = 
    searchTerm.trim() !== '' ||
    selectedStage !== 'all' ||
    selectedProgress !== 'all' ||
    selectedYear !== 'all' ||
    selectedProgramStudi !== 'all' ||
    quickDateFilter !== 'all' ||
    customDateRange.start !== '' ||
    customDateRange.end !== ''

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border-2 border-gray-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Quick stats */}
        <div className="mt-2 flex items-center gap-4 text-sm text-blue-100">
          <span>📊 Total: {students.length}</span>
          <span>✅ Hasil: {filteredStudents.length}</span>
          {hasActiveFilters && (
            <span className="bg-white/20 px-2 py-1 rounded text-xs">
              🔍 Filter aktif
            </span>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-gray-800">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              🔍 Pencarian
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama, NIM, judul, atau pembimbing..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year Filter */}
            {config.enableYearFilter && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  🎓 Tahun Angkatan
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                >
                  {yearOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Program Studi Filter */}
            {config.enableProgramStudiFilter && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  📚 Program Studi
                </label>
                <select
                  value={selectedProgramStudi}
                  onChange={(e) => setSelectedProgramStudi(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {programStudiOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stage Filter */}
            {config.enableStageFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Tahapan
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Progress Filter */}
            {config.enableProgressFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📈 Status Progress
                </label>
                <select
                  value={selectedProgress}
                  onChange={(e) => setSelectedProgress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROGRESS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Date Filter */}
            {config.enableDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Filter Tanggal
                </label>
                <select
                  value={quickDateFilter}
                  onChange={(e) => {
                    setQuickDateFilter(e.target.value)
                    if (e.target.value !== 'all') {
                      setCustomDateRange({ start: '', end: '' })
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {QUICK_DATE_FILTERS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Advanced Date Range */}
          {config.enableDateFilter && (
            <div>
              <button
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Filter Tanggal Kustom
              </button>

              {showAdvancedFilter && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => {
                        setCustomDateRange(prev => ({ ...prev, start: e.target.value }))
                        setQuickDateFilter('all')
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => {
                        setCustomDateRange(prev => ({ ...prev, end: e.target.value }))
                        setQuickDateFilter('all')
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                🗑️ Hapus Semua Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Mini Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pencarian cepat..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Active Filters Count */}
            {hasActiveFilters && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {[
                  searchTerm.trim() !== '',
                  selectedYear !== 'all',
                  selectedProgramStudi !== 'all',
                  selectedStage !== 'all',
                  selectedProgress !== 'all',
                  quickDateFilter !== 'all',
                  customDateRange.start !== '' || customDateRange.end !== ''
                ].filter(Boolean).length} filter aktif
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
