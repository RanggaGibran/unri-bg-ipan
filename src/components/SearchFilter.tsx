'use client'

import { useState, useMemo, useEffect } from 'react'
import { Student } from '@/types/database'

interface SearchFilterProps {
  students: Student[]
  onFilteredStudentsChange: (filteredStudents: Student[]) => void
}

export default function SearchFilter({ students, onFilteredStudentsChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const getStudentStatus = (student: Student) => {
    if (student.is_completed) return 'completed'
    if (student.uk_date) return 'uk'
    if (student.shp_date) return 'shp'
    if (student.sup_date) return 'sup'
    if (student.uj3_date) return 'uj3'
    return 'new'
  }

  const getProgressPercentage = (student: Student) => {
    let progress = 0
    if (student.uj3_date) progress += 25
    if (student.sup_date) progress += 25
    if (student.shp_date) progress += 25
    if (student.uk_date) progress += 25
    return progress
  }

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const searchMatch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.thesis_title && student.thesis_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.supervisor_1 && student.supervisor_1.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.supervisor_2 && student.supervisor_2.toLowerCase().includes(searchTerm.toLowerCase()))

      // Status filter
      let statusMatch = true
      if (statusFilter !== 'all') {
        const studentStatus = getStudentStatus(student)
        statusMatch = studentStatus === statusFilter
      }

      // Progress filter
      let progressMatch = true
      if (progressFilter !== 'all') {
        const progress = getProgressPercentage(student)
        switch (progressFilter) {
          case 'not_started':
            progressMatch = progress === 0
            break
          case 'in_progress':
            progressMatch = progress > 0 && progress < 100
            break
          case 'completed':
            progressMatch = progress === 100 || student.is_completed
            break
        }
      }

      return searchMatch && statusMatch && progressMatch
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'nim':
          aValue = a.nim
          bValue = b.nim
          break
        case 'updated_at':
          aValue = new Date(a.updated_at)
          bValue = new Date(b.updated_at)
          break
        case 'progress':
          aValue = getProgressPercentage(a)
          bValue = getProgressPercentage(b)
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [students, searchTerm, statusFilter, progressFilter, sortBy, sortOrder])

  // Update parent component when filtered students change
  useEffect(() => {
    onFilteredStudentsChange(filteredAndSortedStudents)
  }, [filteredAndSortedStudents, onFilteredStudentsChange])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setProgressFilter('all')
    setSortBy('name')
    setSortOrder('asc')
  }

  const activeFiltersCount = [
    searchTerm !== '',
    statusFilter !== 'all',
    progressFilter !== 'all',
    sortBy !== 'name' || sortOrder !== 'asc'
  ].filter(Boolean).length

  return (
    <div className="bg-gray-800/30 rounded-lg shadow-sm border border-gray-600/50 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-200 mb-2">
            🔍 Cari Mahasiswa
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIM, judul, atau pembimbing..."
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <label htmlFor="status" className="block text-sm font-medium text-gray-200 mb-2">
            📊 Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          >
            <option value="all">Semua Status</option>
            <option value="new">Baru</option>
            <option value="uj3">UJ3</option>
            <option value="sup">SUP</option>
            <option value="shp">SHP</option>
            <option value="uk">UK</option>
            <option value="completed">Kompre</option>
          </select>
        </div>

        {/* Progress Filter */}
        <div className="min-w-[160px]">
          <label htmlFor="progress" className="block text-sm font-medium text-gray-200 mb-2">
            📈 Progress
          </label>
          <select
            id="progress"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
          >
            <option value="all">Semua Progress</option>
            <option value="not_started">Belum Dimulai (0%)</option>
            <option value="in_progress">Dalam Progress (1-99%)</option>
            <option value="completed">Selesai (100%)</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="min-w-[160px]">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-200 mb-2">
            🔄 Urutkan
          </label>
          <div className="flex gap-2">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            >
              <option value="name">Nama</option>
              <option value="nim">NIM</option>
              <option value="progress">Progress</option>
              <option value="updated_at">Update Terakhir</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              title={`Ubah ke ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary & Clear Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-600/50">
        <div className="text-sm text-gray-300">
          <span className="font-medium">{filteredAndSortedStudents.length}</span> dari{' '}
          <span className="font-medium">{students.length}</span> mahasiswa
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-blue-400">
              ({activeFiltersCount} filter aktif)
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            🔄 Reset Filter
          </button>
        )}
      </div>

      {/* Quick Filter Badges */}
      {(searchTerm || statusFilter !== 'all' || progressFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Pencarian: &quot;{searchTerm}&quot;
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {statusFilter.toUpperCase()}
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          
          {progressFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Progress: {progressFilter === 'not_started' ? 'Belum Dimulai' : 
                        progressFilter === 'in_progress' ? 'Dalam Progress' : 'Selesai'}
              <button
                onClick={() => setProgressFilter('all')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
