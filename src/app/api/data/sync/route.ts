import { NextRequest, NextResponse } from 'next/server'
import { syncWithExternalSystem } from '@/lib/dataManagement'

// Handle data synchronization with external systems
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiUrl, apiKey, syncDirection, systemType } = body

    // Validate required parameters
    if (!apiUrl || !syncDirection) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiUrl, syncDirection' },
        { status: 400 }
      )
    }

    if (!['import', 'export', 'bidirectional'].includes(syncDirection)) {
      return NextResponse.json(
        { error: 'Invalid syncDirection. Use: import, export, or bidirectional' },
        { status: 400 }
      )
    }

    // Perform synchronization
    const result = await syncWithExternalSystem({
      apiUrl,
      apiKey,
      syncDirection
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        synced: result.synced,
        systemType: systemType || 'unknown'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        conflicts: result.conflicts
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get sync status and configuration
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'status') {
      // Return sync status information
      return NextResponse.json({
        success: true,
        status: {
          lastSync: localStorage.getItem('lastSyncTime') || null,
          syncEnabled: true,
          supportedSystems: ['SIAKAD', 'FEEDER', 'Custom API'],
          supportedDirections: ['import', 'export', 'bidirectional']
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Sync status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
