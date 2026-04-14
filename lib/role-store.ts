/**
 * Simple client-side role store using sessionStorage
 * This provides persistent role data across page navigations
 */

export interface RoleData {
  role: 'manager' | 'worker'
  venue_name: string | null
  venue_plan: string
  source?: string
  timestamp: number
}

const STORAGE_KEY = 'user_role_data'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export const roleStore = {
  get(): RoleData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const data = JSON.parse(stored) as RoleData
      const age = Date.now() - data.timestamp
      
      // Check if cache is still valid
      if (age > CACHE_TTL) {
        sessionStorage.removeItem(STORAGE_KEY)
        return null
      }
      
      return data
    } catch {
      return null
    }
  },

  set(data: Omit<RoleData, 'timestamp'>): void {
    if (typeof window === 'undefined') return
    
    try {
      const roleData: RoleData = {
        ...data,
        timestamp: Date.now()
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(roleData))
    } catch (err) {
      console.error('Failed to store role data:', err)
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(STORAGE_KEY)
  }
}