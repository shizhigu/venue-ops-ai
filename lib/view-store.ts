/**
 * Store for manager's view preference
 */

const VIEW_KEY = 'manager_view_preference'

export const viewStore = {
  get(): 'manager' | 'worker' {
    if (typeof window === 'undefined') return 'manager'
    
    const stored = localStorage.getItem(VIEW_KEY)
    return stored === 'worker' ? 'worker' : 'manager'
  },

  set(view: 'manager' | 'worker'): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(VIEW_KEY, view)
  }
}