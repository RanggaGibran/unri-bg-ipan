import { NextRequest, NextResponse } from 'next/server'
import { validateDatabaseIntegrity, repairDatabaseIssues, optimizeDatabase } from '@/lib/dataManagement'

// Handle database validation and maintenance operations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'validate') {
      // Validate database integrity
      const validation = await validateDatabaseIntegrity()
      
      return NextResponse.json({
        success: true,
        validation: {
          isValid: validation.valid,
          issues: validation.issues,
          statistics: validation.statistics
        }
      })
    }

    if (action === 'optimize') {
      // Optimize database performance
      const optimization = await optimizeDatabase()
      
      return NextResponse.json({
        success: optimization.success,
        message: optimization.message,
        actions: optimization.actions
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter. Use: validate, optimize' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Database maintenance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle database repair operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, issues } = body

    if (action === 'repair') {
      if (!issues || !Array.isArray(issues)) {
        return NextResponse.json(
          { error: 'Issues array is required for repair operation' },
          { status: 400 }
        )
      }

      // Attempt to repair database issues
      const repairResult = await repairDatabaseIssues(issues)
      
      return NextResponse.json({
        success: repairResult.success,
        repaired: repairResult.repaired,
        failed: repairResult.failed,
        message: repairResult.success 
          ? `Repaired ${repairResult.repaired.length} issues` 
          : 'Some issues could not be repaired automatically'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: repair' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Database repair API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
