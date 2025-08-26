'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [status, setStatus] = useState('Connecting...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('students')
          .select('count')
          .limit(1)

        if (error) {
          setError(error.message)
          setStatus('Connection failed')
        } else {
          setStatus('Connected to database!')
          setError(null)
        }
      } catch (err) {
        console.error('Connection error:', err)
        setError('Unable to connect to database')
        setStatus('Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Database Connection Test</h1>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Status:</p>
          <p className={`font-semibold ${status === 'Connected to database!' ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>Environment variables:</p>
          <ul className="mt-2 space-y-1">
            <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}</li>
            <li>SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
