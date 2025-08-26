"use client"
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DosenAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}


export const DosenAutocomplete: React.FC<DosenAutocompleteProps> = ({ value, onChange, placeholder, className }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dosenList, setDosenList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDosen() {
      setLoading(true);
      const { data, error } = await supabase.from('dosen_list').select('name');
      if (!error && data) {
        setDosenList(data.map((d: any) => d.name));
      }
      setLoading(false);
    }
    fetchDosen();
  }, []);

  const filtered = dosenList.filter(
    (name) => name.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        disabled={loading}
      />
      {showDropdown && value && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl mt-1 max-h-48 overflow-auto">
          {filtered.map((name) => (
            <li
              key={name}
              className="px-4 py-3 cursor-pointer hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 transition-colors"
              onMouseDown={() => {
                onChange(name);
                setShowDropdown(false);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && value && filtered.length === 0 && dosenList.length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl mt-1 px-4 py-3 text-gray-300">
          Tidak ada dosen yang cocok
        </div>
      )}
      {loading && (
        <div className="absolute left-0 right-0 mt-1 px-4 py-3 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Memuat daftar dosen...
          </span>
        </div>
      )}
    </div>
  );
};
