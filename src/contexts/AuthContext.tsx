'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const authStatus = localStorage.getItem('isAdminAuthenticated')
    const authTimestamp = localStorage.getItem('authTimestamp')
    
    if (authStatus === 'true' && authTimestamp) {
      // Check if session is still valid (24 hours)
      const now = new Date().getTime()
      const authTime = parseInt(authTimestamp)
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (now - authTime < twentyFourHours) {
        setIsAuthenticated(true)
      } else {
        // Session expired
        localStorage.removeItem('isAdminAuthenticated')
        localStorage.removeItem('authTimestamp')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      // Verify password with API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('isAdminAuthenticated', 'true')
        localStorage.setItem('authTimestamp', new Date().getTime().toString())
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAdminAuthenticated')
    localStorage.removeItem('authTimestamp')
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
