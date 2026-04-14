import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { roleStore } from '@/lib/role-store'

export type UserRole = 'manager' | 'worker'

interface UserRoleData {
  role: UserRole
  venue_name: string | null
  venue_plan: string
  clerk_role: string | null
}

export function useUserRole() {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState<UserRole>('worker')
  const [roleData, setRoleData] = useState<UserRoleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Don't fetch if user not loaded
    if (!isLoaded) {
      setIsLoading(false)
      return
    }

    // No user, clear everything
    if (!user) {
      roleStore.clear()
      setRole('worker')
      setRoleData(null)
      setIsLoading(false)
      return
    }

    // Check sessionStorage first
    const cached = roleStore.get()
    if (cached) {
      setRole(cached.role)
      setRoleData(cached)
      setIsLoading(false)
      
      // Don't fetch again if we already have valid cached data
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true
      }
      return
    }

    // Fetch from API only if no cache and haven't fetched yet
    if (hasFetchedRef.current) {
      setIsLoading(false)
      return
    }

    async function fetchRole() {
      try {
        hasFetchedRef.current = true
        setIsLoading(true)
        
        const response = await fetch('/api/user/role')
        if (!response.ok) {
          throw new Error('Failed to fetch user role')
        }
        
        const data = await response.json()
        
        // Store in sessionStorage
        roleStore.set(data)
        
        setRole(data.role)
        setRoleData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setRole('worker')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [user?.id, isLoaded]) // Only depend on user ID and loaded state

  // 权限检查函数
  const canManage = () => role === 'manager'
  const canAssignTasks = () => role === 'manager'
  const canViewReports = () => role === 'manager'
  const canEditVenueSettings = () => role === 'manager' && roleData?.venue_plan !== 'basic'

  return {
    role,
    roleData,
    isLoading,
    error,
    // 权限检查
    canManage,
    canAssignTasks,
    canViewReports,
    canEditVenueSettings,
    // 用户信息
    user,
    isUserLoaded: isLoaded
  }
}