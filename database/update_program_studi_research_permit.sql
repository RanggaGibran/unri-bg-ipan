-- Update field program_studi untuk hanya 2 pilihan
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_program_studi_check;

ALTER TABLE students 
ADD CONSTRAINT students_program_studi_check 
CHECK (program_studi IN ('Teknologi Hasil Pertanian', 'Teknologi Industri Pertanian'));

-- Update existing data (jika ada)
-- UPDATE students SET program_studi = 'Teknologi Hasil Pertanian' WHERE program_studi IS NULL;

-- Menambahkan comment untuk field research_permit
COMMENT ON COLUMN students.research_permit IS 'Tanggal izin penelitian (format: YYYY-MM-DD)';

/* Program Studi Field */
<div>
  <label htmlFor="program_studi" className="block text-sm font-medium text-gray-700 mb-2">
    📚 Program Studi <span className="text-red-500">*</span>
  </label>
  <select
    id="program_studi"
    name="program_studi"
    value={formData.program_studi}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
    required
  >
    <option value="">Pilih Program Studi</option>
    {programStudiOptions.map((prodi) => (
      <option key={prodi} value={prodi}>
        {prodi}
      </option>
    ))}
  </select>
</div>

{/* Tanggal Izin Penelitian Field */}
<div>
  <label htmlFor="research_permit" className="block text-sm font-medium text-gray-700 mb-2">
    📅 Tanggal Izin Penelitian
  </label>
  <input
    type="date"
    id="research_permit"
    name="research_permit"
    value={formData.research_permit}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
  />
  <p className="mt-1 text-sm text-gray-500">
    Tanggal diterbitkan surat izin penelitian
  </p>
</div>

// Di StudentsList.tsx dan detail pages
{student.research_permit && (
  <div className="text-sm text-gray-600">
    📅 Izin Penelitian: {new Date(student.research_permit).toLocaleDateString('id-ID')}
  </div>
)}