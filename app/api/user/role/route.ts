import { auth, currentUser } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { mapClerkRoleToSystemRole } from '@/lib/clerk-utils'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 先尝试从数据库获取（最准确的数据源）
    const result = await sql`
      SELECT 
        u.role,
        v.name as venue_name,
        v.plan as venue_plan
      FROM users u
      JOIN venues v ON u.venue_id = v.id
      WHERE u.clerk_user_id = ${userId}
        AND u.is_active = true
      ORDER BY u.updated_at DESC
      LIMIT 1
    `
    
    if (result.length > 0) {
      // 数据库有记录，直接返回
      return NextResponse.json({
        role: result[0].role,
        venue_name: result[0].venue_name,
        venue_plan: result[0].venue_plan,
        source: 'database'
      })
    }
    
    // 2. 数据库没有记录，使用 Clerk 的实时数据
    // （这种情况通常是因为 webhook 还在处理中）
    const orgMembership = user?.organizationMemberships?.[0]
    const clerkRole = orgMembership?.role
    
    // 根据 Clerk 角色判断
    const role = mapClerkRoleToSystemRole(clerkRole)
    
    return NextResponse.json({
      role: role,
      venue_name: orgMembership?.organization?.name || 'New Venue',
      venue_plan: 'basic',
      source: 'clerk',  // 标记数据来源
      is_syncing: true  // 提示用户数据正在同步
    })
    
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    )
  }
}