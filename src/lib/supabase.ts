import { createClient } from '@supabase/supabase-js'

// Next.js environment variables - use fallback values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://boyyfwfjqczykgufyasp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTA0MjUsImV4cCI6MjA3NDEyNjQyNX0.q5RlpJyVSK7dqbP1BpTc4l4ruL8-e_VUs4wzcKOKoAA'

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// For client-side usage in Next.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// For service role operations (admin) - fallback values for development
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MDQyNSwiZXhwIjoyMDc0MTI2NDI1fQ.cCvbJ2CbzK9HPDLZYDBva6mTCVCosONKgcgV3EIY5XA'

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)