"use client"
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DosenManagementPage() {
  const [dosenList, setDosenList] = useState<string[]>([])
  const [newDosen, setNewDosen] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch dosen list from Supabase (or localStorage fallback)
  useEffect(() => {
    fetchDosen()
  }, [])

  async function fetchDosen() {
    setLoading(true)
    setError('')
    try {
      // Fetch dari Supabase table 'dosen_list' dengan field 'name'
      const { data, error } = await supabase.from('dosen_list').select('name')
      if (error) {
        console.error('Supabase fetch error:', error)
        if (error.message.includes('relation "dosen_list" does not exist')) {
          setError('Tabel dosen_list belum dibuat. Jalankan script SQL di Supabase Dashboard.')
        } else {
          setError('Gagal mengambil data dosen: ' + error.message)
        }
        setDosenList([])
      } else {
        const names = data?.map((d: any) => d.name) || []
        setDosenList(names)
        console.log('Fetched dosen list:', names)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Gagal mengambil data dosen: ' + (err as Error).message)
      setDosenList([])
    }
    setLoading(false)
  }

  async function handleAddDosen(e: React.FormEvent) {
    e.preventDefault()
    if (!newDosen.trim()) return
    setLoading(true)
    setError('')
    try {
      // Insert ke Supabase, pastikan format array of object dan field benar
      const { error, data } = await supabase.from('dosen_list').insert([{ name: newDosen.trim() }])
      if (error) {
        console.error('Supabase insert error:', error)
        if (error.message.includes('relation "dosen_list" does not exist')) {
          setError('Tabel dosen_list belum dibuat. Jalankan script SQL di Supabase Dashboard.')
        } else {
          setError(error.message || 'Gagal menambah dosen')
        }
      } else {
        setNewDosen('')
        setError('')
        await fetchDosen() // Refresh list after successful add
        console.log('Insert successful:', data)
      }
    } catch (err) {
      console.error('Add dosen error:', err)
      setError('Gagal menambah dosen: ' + (err as Error).message)
    }
    setLoading(false)
  }

  async function handleDeleteDosen(name: string) {
    if (!confirm(`Hapus dosen ${name}?`)) return
    setLoading(true)
    setError('')
    try {
      const { error, data } = await supabase.from('dosen_list').delete().eq('name', name)
      if (error) {
        console.error('Supabase delete error:', error)
        setError(`Gagal menghapus dosen: ${error.message}`)
      } else {
        console.log('Delete successful:', data)
        setError('')
        await fetchDosen() // Refresh list after successful delete
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Gagal menghapus dosen: ' + (err as Error).message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/30 py-8">
      <div className="max-w-2xl mx-auto bg-gray-900/95 rounded-2xl border-2 border-gray-700 shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">👨‍🏫 Manajemen Nama Dosen</h1>
          <p className="text-gray-300">Kelola daftar nama dosen pembimbing dan penguji</p>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <a
            href="/students"
            className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold border border-gray-600 hover:border-gray-500"
          >
            <span>←</span>
            <span>Kembali ke Management Mahasiswa</span>
          </a>
          <a
            href="/dosen-detail"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold border border-emerald-500"
          >
            <span>📊</span>
            <span>Detail Dosen</span>
          </a>
        </div>
        <form onSubmit={handleAddDosen} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newDosen}
            onChange={e => setNewDosen(e.target.value)}
            placeholder="Nama dosen baru"
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors border border-blue-500 min-w-[100px]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Loading...
              </span>
            ) : (
              'Tambah'
            )}
          </button>
        </form>
        {error && <div className="text-red-300 bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-4 font-medium">{error}</div>}
        <ul className="divide-y divide-gray-700">
          {dosenList.map((name) => (
            <li key={name} className="flex items-center justify-between py-3">
              <span className="text-white font-medium">{name}</span>
              <button
                onClick={() => handleDeleteDosen(name)}
                className="text-red-300 hover:text-red-100 px-4 py-2 rounded-lg border border-red-400 hover:bg-red-800/30 transition-colors font-semibold bg-red-900/20 min-w-[70px]"
                disabled={loading}
              >
                {loading ? '...' : 'Hapus'}
              </button>
            </li>
          ))}
        </ul>
        {dosenList.length === 0 && !loading && (
          <div className="text-gray-300 text-center mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <span className="text-xl">📚</span>
            <p className="mt-2">Belum ada nama dosen yang terdaftar.</p>
            <p className="text-sm text-gray-400 mt-1">Tambahkan nama dosen menggunakan form di atas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
