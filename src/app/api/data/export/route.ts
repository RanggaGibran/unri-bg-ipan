import { NextRequest, NextResponse } from 'next/server'
import { exportStudentsToExcel } from '@/lib/dataManagement'
import { supabase } from '@/lib/supabase'

// Handle data export operations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'excel'
    const type = searchParams.get('type') || 'all'

    if (format === 'excel' || format === 'csv') {
      // Export to Excel/CSV
      await exportStudentsToExcel()
      
      return NextResponse.json({
        success: true,
        message: 'Data exported successfully',
        format: 'excel'
      })
    }

    if (format === 'json') {
      // Get data based on type
      let query = supabase.from('students').select('*')
      
      if (type === 'active') {
        query = query.eq('is_completed', false)
      } else if (type === 'completed') {
        query = query.eq('is_completed', true)
      }
      
      const { data, error } = await query.order('created_at', { ascending: true })
      
      if (error) {
        throw new Error(`Failed to fetch ${type} students: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0,
        type,
        exportedAt: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid format parameter. Use: excel, csv, or json' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle data import operations
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('data') as File
    const action = formData.get('action') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No data file provided' },
        { status: 400 }
      )
    }

    if (action === 'validate') {
      // Validate file format and structure
      const fileContent = await file.text()
      
      try {
        const data = JSON.parse(fileContent)
        
        // Basic validation
        if (!Array.isArray(data) && !data.students) {
          throw new Error('Invalid data format')
        }
        
        const students = Array.isArray(data) ? data : data.students
        
        // Validate each student record
        const errors: string[] = []
        students.forEach((student: any, index: number) => {
          if (!student.nim) {
            errors.push(`Row ${index + 1}: NIM is required`)
          }
          if (!student.name) {
            errors.push(`Row ${index + 1}: Name is required`)
          }
        })
        
        return NextResponse.json({
          success: true,
          valid: errors.length === 0,
          studentsCount: students.length,
          errors: errors.slice(0, 10), // Limit errors shown
          message: errors.length === 0 
            ? `File is valid with ${students.length} students`
            : `Found ${errors.length} validation errors`
        })
        
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          valid: false,
          message: 'Invalid JSON format',
          errors: ['File must be valid JSON format']
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Import API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
