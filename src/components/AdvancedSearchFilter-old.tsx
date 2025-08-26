// Minimal safe stub for legacy AdvancedSearchFilter to avoid build parse errors.
// This file intentionally provides a lightweight placeholder; use `AdvancedSearchFilter.tsx` for full functionality.

'use client'

import React from 'react'
import { Student } from '@/types/database'

type Props = {
  students?: Student[]
  onFilteredStudentsChange?: (results: Student[]) => void
  title?: string
  className?: string
}

export default function AdvancedSearchFilterOld({ students = [], onFilteredStudentsChange, title = 'Pencarian (Legacy)', className = '' }: Props) {
  // Keep behavior minimal: notify parent with original list on mount if callback provided.
  React.useEffect(() => {
    onFilteredStudentsChange?.(students)
  }, [students, onFilteredStudentsChange])

  return (
    <div className={className} aria-label={title}>
      {/* Legacy filter removed for stability. Use the new AdvancedSearchFilter component. */}
      <div className="p-4 text-sm text-gray-400">Legacy AdvancedSearchFilter (placeholder)</div>
    </div>
  )
}
