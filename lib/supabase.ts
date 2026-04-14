import { createClient } from '@supabase/supabase-js'

// For server-side operations (with service role key)
export const supabaseAdmin = createClient(
  process.env.DATABASE_URL?.replace('postgresql://', 'https://').split('@')[1].split('/')[0] + '.supabase.co' || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper to create client from connection string
export function createSupabaseFromConnectionString(connectionString: string) {
  // Parse PostgreSQL connection string to get Supabase URL
  // Format: postgresql://user:password@host:port/database
  const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/)
  
  if (!match) {
    throw new Error('Invalid connection string format')
  }
  
  const [, user, password, host, database] = match
  
  // For Neon, we'll use direct PostgreSQL connection
  // Since Supabase client expects HTTP endpoint, we'll need to handle this differently
  return { connectionString, user, password, host, database }
}