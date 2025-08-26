// Types untuk aplikasi Progress Ujian Akhir Mahasiswa

export interface Student {
  id: number
  nim: string
  name: string
  program_studi: string | null
  thesis_title: string | null
  research_permit: string | null
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

export interface StudentFormData {
  nim: string
  name: string
  program_studi?: string
  thesis_title?: string
  research_permit?: string
  
  // Surat Tugas (UJ3)
  uj3_date?: string
  supervisor_1?: string
  supervisor_2?: string
  
  // SUP (Seminar Usulan Penelitian)
  sup_date?: string
  sup_supervisor_1?: string
  sup_supervisor_2?: string
  sup_examiner_1?: string
  sup_examiner_2?: string
  
  // SHP (Seminar Hasil Penelitian)
  shp_date?: string
  shp_supervisor_1?: string
  shp_supervisor_2?: string
  shp_examiner_1?: string
  shp_examiner_2?: string
  
  // UK (Ujian Komprehensif)
  uk_date?: string
  uk_examiner_1?: string
  uk_examiner_2?: string
  uk_examiner_3?: string
  uk_examiner_4?: string
}

export interface Statistics {
  total: number
  completed: number
  active: number
}

export interface ExamStage {
  id: string
  name: string
  shortName: string
  description: string
  color: string
  fields: string[]
}

export const EXAM_STAGES: ExamStage[] = [
  {
    id: 'uj3',
    name: 'Surat Tugas (UJ3)',
    shortName: 'UJ3',
    description: 'Surat tugas untuk memulai proses ujian akhir',
    color: 'blue',
    fields: ['uj3_date', 'supervisor_1', 'supervisor_2']
  },
  {
    id: 'sup',
    name: 'Seminar Usulan Penelitian',
    shortName: 'SUP',
    description: 'Seminar untuk mempresentasikan usulan penelitian',
    color: 'green',
    fields: ['sup_date', 'sup_supervisor_1', 'sup_supervisor_2', 'sup_examiner_1', 'sup_examiner_2']
  },
  {
    id: 'shp',
    name: 'Seminar Hasil Penelitian',
    shortName: 'SHP',
    description: 'Seminar untuk mempresentasikan hasil penelitian',
    color: 'purple',
    fields: ['shp_date', 'shp_supervisor_1', 'shp_supervisor_2', 'shp_examiner_1', 'shp_examiner_2']
  },
  {
    id: 'uk',
    name: 'Ujian Komprehensif',
    shortName: 'UK',
    description: 'Ujian komprehensif sebagai tahap akhir',
    color: 'orange',
    fields: ['uk_date', 'uk_examiner_1', 'uk_examiner_2', 'uk_examiner_3', 'uk_examiner_4']
  }
]

export interface DatabaseResponse<T> {
  data: T | null
  error: any
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}
