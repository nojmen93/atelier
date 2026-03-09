import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin client using the service role key.
 * Bypasses RLS — use only in server components and API routes.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
