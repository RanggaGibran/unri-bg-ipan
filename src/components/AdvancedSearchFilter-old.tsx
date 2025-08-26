'use client'

import { useState, useMemo } from 'react'
import { Student } from '@/types/database'

interface FilterConfig {
  searchFields: string[]
  enableStageFilter?: boolean
  enableDateFilter?: boolean
  enableProgressFilter?: boolean
  dateField?: string
  multipleDateFields?: boolean
  customDateFields?: { field: string; label: string }[]
}

interface AdvancedSearchFilterProps {
  students: Student[]
  onFilteredStudentsChange: (filteredStudents: Student[]) => void
  config: FilterConfig
  title?: string
  className?: string
}

export default function AdvancedSearchFilter({ 
  students, 
  onFilteredStudentsChange, 
  config,
  title = "🔍 Pencarian & Filter Lanjutan",
  className = ""
}: AdvancedSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')
  const [dateField, setDateField] = useState(config.dateField || 'uk_date')
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [quickDateFilter, setQuickDateFilter] = useState('all')

  // Get the highest completed stage for a student
  const getCompletedStage = (student: Student) => {
    if (student.uk_date) return 'uk'
    if (student.shp_date) return 'shp'
    if (student.sup_date) return 'sup'
    if (student.uj3_date) return 'uj3'
    return 'none'
  }

  // Get progress percentage
  const getProgressPercentage = (student: Student) => {
    let progress = 0
    if (student.uj3_date) progress += 25
    if (student.sup_date) progress += 25
    if (student.shp_date) progress += 25
    if (student.uk_date) progress += 25
    return progress
  }

  // Check if date is within range
  const isDateInRange = (dateString: string | null, field: string) => {
    if (!dateString) return false
    if (!dateRangeStart && !dateRangeEnd) return true
    
    const date = new Date(dateString)
    const start = dateRangeStart ? new Date(dateRangeStart) : null
    const end = dateRangeEnd ? new Date(dateRangeEnd) : null
    
    if (start && end) {
      return date >= start && date <= end
    } else if (start) {
      return date >= start
    } else if (end) {
      return date <= end
    }
    
    return true
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setStageFilter('all')
    setProgressFilter('all')
    setDateRangeStart('')
    setDateRangeEnd('')
    setQuickDateFilter('all')
  }

  // Set quick date filters
  const setQuickDate = (period: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        setDateRangeStart(today.toISOString().split('T')[0])
        setDateRangeEnd(today.toISOString().split('T')[0])
        break
      case 'this_week':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        setDateRangeStart(startOfWeek.toISOString().split('T')[0])
        setDateRangeEnd(endOfWeek.toISOString().split('T')[0])
        break
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        setDateRangeStart(startOfMonth.toISOString().split('T')[0])
        setDateRangeEnd(endOfMonth.toISOString().split('T')[0])
        break
      case 'last_30_days':
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        setDateRangeStart(thirtyDaysAgo.toISOString().split('T')[0])
        setDateRangeEnd(today.toISOString().split('T')[0])
        break
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const endOfYear = new Date(today.getFullYear(), 11, 31)
        setDateRangeStart(startOfYear.toISOString().split('T')[0])
        setDateRangeEnd(endOfYear.toISOString().split('T')[0])
        break
      default:
        setDateRangeStart('')
        setDateRangeEnd('')
    }
    setQuickDateFilter(period)
  }

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (stageFilter !== 'all') count++
    if (progressFilter !== 'all') count++
    if (dateRangeStart || dateRangeEnd) count++
    return count
  }

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        config.searchFields.some(field => {
          const value = (student as any)[field]
          return value && value.toLowerCase().includes(searchTerm.toLowerCase())
        })

      // Stage filter
      let matchesStage = true
      if (config.enableStageFilter && stageFilter !== 'all') {
        const studentStage = getCompletedStage(student)
        matchesStage = studentStage === stageFilter
      }

      // Progress filter
      let matchesProgress = true
      if (config.enableProgressFilter && progressFilter !== 'all') {
        const progress = getProgressPercentage(student)
        switch (progressFilter) {
          case 'not_started':
            matchesProgress = progress === 0
            break
          case 'in_progress':
            matchesProgress = progress > 0 && progress < 100
            break
          case 'completed':
            matchesProgress = progress === 100
            break
        }
      }

      // Date range filter
      let matchesDateRange = true
      if (config.enableDateFilter && config.dateField) {
        const dateValue = (student as any)[config.dateField]
        matchesDateRange = isDateInRange(dateValue, config.dateField)
      }

      return matchesSearch && matchesStage && matchesProgress && matchesDateRange
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'nim':
          aValue = a.nim
          bValue = b.nim
          break
        case 'progress':
          aValue = getProgressPercentage(a)
          bValue = getProgressPercentage(b)
          break
        case 'updated_at':
          aValue = a.updated_at ? new Date(a.updated_at) : new Date(0)
          bValue = b.updated_at ? new Date(b.updated_at) : new Date(0)
          break
        default:
          if (config.dateField && sortBy === config.dateField) {
            aValue = (a as any)[config.dateField] ? new Date((a as any)[config.dateField]) : new Date(0)
            bValue = (b as any)[config.dateField] ? new Date((b as any)[config.dateField]) : new Date(0)
          } else {
            return 0
          }
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [students, searchTerm, stageFilter, progressFilter, dateRangeStart, dateRangeEnd, sortBy, sortOrder, config])

  // Trigger callback when filtered students change
  useMemo(() => {
    onFilteredStudentsChange(filteredAndSortedStudents)
  }, [filteredAndSortedStudents, onFilteredStudentsChange])

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center gap-3">
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                {getActiveFiltersCount()} Filter Aktif
              </span>
            )}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              {showAdvancedFilters ? '🔼' : '🔽'} Filter Lanjutan
            </button>
          </div>
        </div>

        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Pencarian
            </label>
            <input
              type="text"
              id="search"
              placeholder="Kata kunci pencarian..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              📈 Urutkan
            </label>
            <div className="flex gap-2">
              <select
                id="sort"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Nama A-Z</option>
                <option value="nim">NIM</option>
                {config.enableProgressFilter && <option value="progress">Progress</option>}
                <option value="updated_at">Terakhir Diupdate</option>
                {config.dateField && <option value={config.dateField}>Tanggal {config.dateField}</option>}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title={sortOrder === 'asc' ? 'Urutkan Menurun' : 'Urutkan Menaik'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* First Row - Stage, Progress, Date Field */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage Filter */}
              {config.enableStageFilter && (
                <div>
                  <label htmlFor="stage-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    📋 Tahapan
                  </label>
                  <select
                    id="stage-filter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="all">Semua Tahapan</option>
                    <option value="none">Belum Mulai</option>
                    <option value="uj3">UJ3 (Surat Tugas)</option>
                    <option value="sup">SUP (Seminar Usulan)</option>
                    <option value="shp">SHP (Seminar Hasil)</option>
                    <option value="uk">UK (Ujian Komprehensif)</option>
                  </select>
                </div>
              )}

              {/* Progress Filter */}
              {config.enableProgressFilter && (
                <div>
                  <label htmlFor="progress-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    📊 Progress
                  </label>
                  <select
                    id="progress-filter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                  >
                    <option value="all">Semua Progress</option>
                    <option value="not_started">Belum Dimulai (0%)</option>
                    <option value="in_progress">Dalam Progress (1-99%)</option>
                    <option value="completed">Selesai (100%)</option>
                  </select>
                </div>
              )}

              {/* Date Field Selector */}
              {config.enableDateFilter && (config.customDateFields || config.multipleDateFields) && (
                <div>
                  <label htmlFor="date-field" className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Field Tanggal
                  </label>
                  <select
                    id="date-field"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={dateField}
                    onChange={(e) => setDateField(e.target.value)}
                  >
                    {config.customDateFields ? (
                      config.customDateFields.map(field => (
                        <option key={field.field} value={field.field}>{field.label}</option>
                      ))
                    ) : (
                      <>
                        <option value="uj3_date">Tanggal UJ3</option>
                        <option value="sup_date">Tanggal SUP</option>
                        <option value="shp_date">Tanggal SHP</option>
                        <option value="uk_date">Tanggal UK</option>
                        <option value="created_at">Tanggal Dibuat</option>
                        <option value="updated_at">Tanggal Update</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Date Range Section */}
            {config.enableDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Filter Tanggal
                </label>
                
                {/* Quick Date Filters */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Semua' },
                      { value: 'today', label: 'Hari Ini' },
                      { value: 'this_week', label: 'Minggu Ini' },
                      { value: 'this_month', label: 'Bulan Ini' },
                      { value: 'last_30_days', label: '30 Hari Terakhir' },
                      { value: 'this_year', label: 'Tahun Ini' }
                    ].map(quick => (
                      <button
                        key={quick.value}
                        onClick={() => setQuickDate(quick.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          quickDateFilter === quick.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {quick.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      id="date-start"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateRangeStart}
                      onChange={(e) => {
                        setDateRangeStart(e.target.value)
                        setQuickDateFilter('custom')
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      id="date-end"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateRangeEnd}
                      onChange={(e) => {
                        setDateRangeEnd(e.target.value)
                        setQuickDateFilter('custom')
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
                    id="progress-filter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                  >
                    <option value="all">Semua Progress</option>
                    <option value="not_started">Belum Dimulai (0%)</option>
                    <option value="in_progress">Dalam Progress (1-99%)</option>
                    <option value="completed">Selesai (100%)</option>
                  </select>
                </div>
              )}

              {/* Date Range Filters */}
              {config.enableDateFilter && (
                <>
                  <div>
                    <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Tanggal Dari
                    </label>
                    <input
                      type="date"
                      id="date-start"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Tanggal Sampai
                    </label>
                    <input
                      type="date"
                      id="date-end"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Active Filters and Results Info */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold text-blue-600">{filteredAndSortedStudents.length}</span> dari <span className="font-semibold">{students.length}</span> data
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Filters Tags */}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-blue-200 rounded-full"
                >
                  ❌
                </button>
              </span>
            )}
            
            {stageFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Tahapan: {stageFilter.toUpperCase()}
                <button
                  onClick={() => setStageFilter('all')}
                  className="hover:bg-green-200 rounded-full"
                >
                  ❌
                </button>
              </span>
            )}

            {progressFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Progress: {progressFilter}
                <button
                  onClick={() => setProgressFilter('all')}
                  className="hover:bg-purple-200 rounded-full"
                >
                  ❌
                </button>
              </span>
            )}
            
            {(dateRangeStart || dateRangeEnd) && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Tanggal: {dateRangeStart || '...'} - {dateRangeEnd || '...'}
                <button
                  onClick={() => {
                    setDateRangeStart('')
                    setDateRangeEnd('')
                  }}
                  className="hover:bg-orange-200 rounded-full"
                >
                  ❌
                </button>
              </span>
            )}
            
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                🗑️ Hapus Semua Filter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
