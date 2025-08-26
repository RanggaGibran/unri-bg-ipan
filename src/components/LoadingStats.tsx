interface LoadingStatsProps {
  isLoading?: boolean
  error?: string | null
}

export default function LoadingStats({ isLoading = false, error = null }: LoadingStatsProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 text-sm">Error memuat data: {error}</span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600 text-sm">Memuat data...</span>
        </div>
      </div>
    )
  }

  return null
}

export function StatCard({ 
  title, 
  value, 
  color = 'gray', 
  description,
  icon 
}: {
  title: string
  value: string | number
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'gray'
  description?: string
  icon?: React.ReactNode
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-50 text-gray-800 border-gray-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs opacity-75 mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  )
}
