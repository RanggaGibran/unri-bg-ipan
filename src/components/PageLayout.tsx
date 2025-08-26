'use client'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background Effects - Konsisten untuk semua halaman */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-blue-900/30 to-purple-900/30"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-80 animate-bounce"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full opacity-70 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full opacity-80 animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      {/* Content dengan z-index lebih tinggi */}
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  )
}
