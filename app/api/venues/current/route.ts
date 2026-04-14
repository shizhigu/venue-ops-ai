import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const { userId, orgId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get venue by Clerk organization ID
    let venue = null
    
    if (orgId) {
      // Organization user - get venue by org ID
      const result = await sql`
        SELECT id, name, clerk_org_id
        FROM venues
        WHERE clerk_org_id = ${orgId}
        LIMIT 1
      `
      venue = result[0]
    } else {
      // Individual user - get venue from user record
      const userResult = await sql`
        SELECT venue_id
        FROM users
        WHERE clerk_user_id = ${userId}
        LIMIT 1
      `
      
      if (userResult[0]) {
        const venueResult = await sql`
          SELECT id, name, clerk_org_id
          FROM venues
          WHERE id = ${userResult[0].venue_id}
          LIMIT 1
        `
        venue = venueResult[0]
      }
    }

    if (!venue) {
      return NextResponse.json(
        { error: 'No venue found for this user/organization' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      venue_id: venue.id,
      venue_name: venue.name,
      clerk_org_id: venue.clerk_org_id
    })

  } catch (error) {
    console.error('Error fetching current venue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venue information' },
      { status: 500 }
    )
  }
}