import { NextResponse } from 'next/server'

export async function GET() {
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const hasSecretKey = !!process.env.CLERK_SECRET_KEY
  
  return NextResponse.json({
    hasPublishableKey,
    hasSecretKey,
    nodeEnv: process.env.NODE_ENV,
    // 不要暴露实际的 key 值，只显示是否存在
    publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...',
  })
}