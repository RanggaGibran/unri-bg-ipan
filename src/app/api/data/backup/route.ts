import { NextRequest, NextResponse } from 'next/server'
import { createDatabaseBackup, importDatabaseBackup } from '@/lib/dataManagement'

// Handle backup operations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'create') {
      // Create and return backup data
      const backup = await createDatabaseBackup()
      
      if (!backup) {
        return NextResponse.json(
          { error: 'Failed to create backup' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: backup,
        message: `Backup created with ${backup.metadata.totalStudents} students`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Backup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle backup restore operations
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('backup') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      )
    }

    // Import backup data
    const result = await importDatabaseBackup(file)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        importedCount: result.importedCount
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        errors: result.errors
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Restore API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
