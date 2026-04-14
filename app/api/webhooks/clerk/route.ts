import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'
import { mapClerkRoleToSystemRole, generateVenueCode } from '@/lib/clerk-utils'

export async function POST(req: Request) {
  // 获取 headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // 如果没有 headers，返回错误
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // 获取 body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // 创建 Svix 实例
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // 验证 webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // 处理 webhook 事件
  const eventType = evt.type
  console.log(`Processing webhook: ${eventType}`)

  // 处理组织（场馆）事件
  if (eventType === 'organization.created') {
    const { id, name, slug, created_at } = evt.data

    try {
      // 生成唯一的 code
      const baseCode = generateVenueCode(id, slug)
      
      // 先尝试使用基础 code
      let venueCode = baseCode
      let suffix = 1
      
      // 检查 code 是否已存在，如果存在则添加数字后缀
      while (true) {
        const existing = await sql`
          SELECT 1 FROM venues WHERE code = ${venueCode} LIMIT 1
        `
        if (existing.length === 0) break
        venueCode = `${baseCode}${suffix}`
        suffix++
        if (suffix > 100) {
          // 防止无限循环，使用随机字符串
          venueCode = `${baseCode}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`
          break
        }
      }

      await sql`
        INSERT INTO venues (
          clerk_org_id,
          name, 
          code,
          plan,
          config,
          created_at
        )
        VALUES (
          ${id},
          ${name},
          ${venueCode},
          'basic',
          ${JSON.stringify({
            created_by_clerk: true,
            original_slug: slug
          })},
          ${new Date(created_at)}
        )
        ON CONFLICT (clerk_org_id) DO UPDATE
        SET 
          name = EXCLUDED.name,
          updated_at = NOW()
      `
      console.log(`Organization ${id} synced as venue with code: ${venueCode}`)
    } catch (error) {
      console.error('Error syncing organization:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'organization.updated') {
    const { id, name } = evt.data

    try {
      await sql`
        UPDATE venues 
        SET name = ${name}, updated_at = NOW()
        WHERE clerk_org_id = ${id}
      `
      console.log(`Organization ${id} updated`)
    } catch (error) {
      console.error('Error updating organization:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'organization.deleted') {
    const { id } = evt.data

    try {
      // 软删除 - 设置过期时间
      await sql`
        UPDATE venues 
        SET expires_at = NOW(), updated_at = NOW()
        WHERE clerk_org_id = ${id}
      `
      console.log(`Organization ${id} marked as expired`)
    } catch (error) {
      console.error('Error deleting organization:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  // 处理组织成员事件
  if (eventType === 'organizationMembership.created') {
    const { id, organization, public_user_data, role } = evt.data

    try {
      // 先确保场馆存在，如果不存在则创建
      let venueResult = await sql`
        SELECT id FROM venues WHERE clerk_org_id = ${organization.id}
      `
      
      if (venueResult.length === 0) {
        console.log(`Venue not found for organization ${organization.id}, creating it now`)
        
        // 创建场馆（可能是 organization.created 事件还没到达）
        const venueCode = generateVenueCode(organization.id, organization.slug)
        venueResult = await sql`
          INSERT INTO venues (
            clerk_org_id,
            name,
            code,
            plan,
            config
          )
          VALUES (
            ${organization.id},
            ${organization.name || 'Unnamed Venue'},
            ${venueCode},
            'basic',
            ${JSON.stringify({
              created_by_membership_event: true,
              organization_slug: organization.slug
            })}
          )
          ON CONFLICT (clerk_org_id) DO UPDATE
          SET updated_at = NOW()
          RETURNING id
        `
      }

      const venueId = venueResult[0].id

      // 创建或更新用户
      const fullName = `${public_user_data.first_name || 'User'} ${public_user_data.last_name || ''}`.trim()
      
      await sql`
        INSERT INTO users (
          clerk_user_id,
          venue_id,
          email,
          name,
          role,
          metadata
        )
        VALUES (
          ${public_user_data.user_id},
          ${venueId},
          ${public_user_data.identifier},
          ${fullName},
          ${mapClerkRoleToSystemRole(role)},
          ${JSON.stringify({
            clerk_membership_id: id,
            clerk_role: role,
            joined_at: new Date()
          })}
        )
        ON CONFLICT (clerk_user_id, venue_id) 
        DO UPDATE SET
          role = EXCLUDED.role,
          is_active = true,
          updated_at = NOW(),
          metadata = users.metadata || EXCLUDED.metadata
      `
      console.log(`User ${public_user_data.user_id} added to venue ${venueId} as ${mapClerkRoleToSystemRole(role)}`)
    } catch (error) {
      console.error('Error adding user to organization:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'organizationMembership.updated') {
    const { organization, public_user_data, role } = evt.data

    try {
      // 更新用户角色
      await sql`
        UPDATE users 
        SET 
          role = ${mapClerkRoleToSystemRole(role)},
          updated_at = NOW()
        WHERE 
          clerk_user_id = ${public_user_data.user_id}
          AND venue_id = (SELECT id FROM venues WHERE clerk_org_id = ${organization.id})
      `
      console.log(`User ${public_user_data.user_id} role updated to ${mapClerkRoleToSystemRole(role)}`)
    } catch (error) {
      console.error('Error updating user role:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data

    try {
      // 软删除用户（从该场馆）
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = NOW()
        WHERE 
          clerk_user_id = ${public_user_data.user_id}
          AND venue_id = (SELECT id FROM venues WHERE clerk_org_id = ${organization.id})
      `
      console.log(`User ${public_user_data.user_id} removed from venue`)
    } catch (error) {
      console.error('Error removing user from organization:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}