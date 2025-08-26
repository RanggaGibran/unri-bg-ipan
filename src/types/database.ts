export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student
        Insert: StudentInsert
        Update: StudentUpdate
      }
    }
  }
}

export interface Student {
  id: number
  nim: string
  name: string
  program_studi: 'Teknologi Hasil Pertanian' | 'Teknologi Industri Pertanian' | null
  thesis_title: string | null
  research_permit: string | null // Date string untuk tanggal izin penelitian
  created_at: string
  updated_at: string
  is_completed: boolean
  
  // Surat Tugas (UJ3)
  uj3_date: string | null
  supervisor_1: string | null
  supervisor_2: string | null
  
  // SUP (Seminar Usulan Penelitian)
  sup_date: string | null
  sup_supervisor_1: string | null
  sup_supervisor_2: string | null
  sup_examiner_1: string | null
  sup_examiner_2: string | null
  
  // SHP (Seminar Hasil Penelitian)
  shp_date: string | null
  shp_supervisor_1: string | null
  shp_supervisor_2: string | null
  shp_examiner_1: string | null
  shp_examiner_2: string | null
  
  // UK (Ujian Komprehensif)
  uk_date: string | null
  uk_examiner_1: string | null
  uk_examiner_2: string | null
  uk_examiner_3: string | null
  uk_examiner_4: string | null
}

export interface StudentInsert {
  id?: number
  nim: string
  name: string
  program_studi?: string | null
  thesis_title?: string | null
  research_permit?: string | null
  created_at?: string
  updated_at?: string
  is_completed?: boolean
  
  uj3_date?: string | null
  supervisor_1?: string | null
  supervisor_2?: string | null
  
  sup_date?: string | null
  sup_supervisor_1?: string | null
  sup_supervisor_2?: string | null
  sup_examiner_1?: string | null
  sup_examiner_2?: string | null
  
  shp_date?: string | null
  shp_supervisor_1?: string | null
  shp_supervisor_2?: string | null
  shp_examiner_1?: string | null
  shp_examiner_2?: string | null
  
  uk_date?: string | null
  uk_examiner_1?: string | null
  uk_examiner_2?: string | null
  uk_examiner_3?: string | null
  uk_examiner_4?: string | null
}

export interface StudentUpdate {
  id?: number
  nim?: string
  name?: string
  program_studi?: string | null
  thesis_title?: string | null
  research_permit?: string | null
  created_at?: string
  updated_at?: string
  is_completed?: boolean
  
  uj3_date?: string | null
  supervisor_1?: string | null
  supervisor_2?: string | null
  
  sup_date?: string | null
  sup_supervisor_1?: string | null
  sup_supervisor_2?: string | null
  sup_examiner_1?: string | null
  sup_examiner_2?: string | null
  
  shp_date?: string | null
  shp_supervisor_1?: string | null
  shp_supervisor_2?: string | null
  shp_examiner_1?: string | null
  shp_examiner_2?: string | null
  
  uk_date?: string | null
  uk_examiner_1?: string | null
  uk_examiner_2?: string | null
  uk_examiner_3?: string | null
  uk_examiner_4?: string | null
}

export interface Statistics {
  total: number
  completed: number
  active: number
}
