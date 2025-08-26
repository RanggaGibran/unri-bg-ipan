import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// NOTE: passing empty strings will satisfy the client at build time. At runtime,
// the app should set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
export const supabase = createClient(supabaseUrl as string, supabaseKey as string)

// Export types for use in other files
export type { Student, StudentInsert, StudentUpdate, Statistics } from '../types/database'
