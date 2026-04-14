/**
 * Simple utility functions for Clerk integration
 */

export type UserRole = 'manager' | 'worker'

/**
 * Maps Clerk organization role to our system role
 */
export function mapClerkRoleToSystemRole(clerkRole: string | null | undefined): UserRole {
  // Clerk uses 'org:admin' for organization admins
  return clerkRole === 'org:admin' ? 'manager' : 'worker'
}

/**
 * Generate a unique venue code from organization data
 */
export function generateVenueCode(orgId: string, slug?: string | null): string {
  if (slug) {
    return slug.toUpperCase()
  }
  // Use first 6 chars of org ID after 'org_'
  return `ORG${orgId.substring(4, 10).toUpperCase()}`
}