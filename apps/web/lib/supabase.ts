import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// Types
// ============================================================

export interface ClientQuoteItem {
  id: string
  quote_id: string
  style_id?: string
  name: string
  description?: string
  mockup_image_urls: string[]
  decoration_type?: 'embroidery' | 'screenprint' | 'dtg' | 'heattransfer'
  colors: string[]
  sizes?: string
  quantity: number
  unit_price: number
  sort_order: number
}

export interface ClientQuote {
  id: string
  secret_id: string
  quote_request_id?: string
  client_name: string
  client_email: string
  client_logo_url?: string
  intro_message?: string
  delivery_timeline?: string
  valid_until?: string
  terms?: string
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'revision' | 'declined' | 'expired'
  client_response_action?: string
  client_response_message?: string
  client_responded_at?: string
  viewed_at?: string
  created_at: string
  items: ClientQuoteItem[]
}

// ============================================================
// Fetchers
// ============================================================

export async function getQuoteBySecretId(secretId: string): Promise<ClientQuote | null> {
  const { data: quote, error } = await supabase
    .from('client_quotes')
    .select('*')
    .eq('secret_id', secretId)
    .single()

  if (error || !quote) return null

  const { data: items } = await supabase
    .from('client_quote_items')
    .select('*')
    .eq('quote_id', quote.id)
    .order('sort_order', { ascending: true })

  return { ...quote, items: items ?? [] }
}
