import { createAdminClient } from '@/lib/supabase/admin'
import QuoteList from './QuoteList'
import QuoteEmptyState from './QuoteEmptyState'

export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
  const supabase = createAdminClient()

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('*, styles!style_id(name, images)')
    .order('created_at', { ascending: false })

  if (!quotes || quotes.length === 0) {
    return <QuoteEmptyState />
  }

  return <QuoteList initialQuotes={quotes} />
}
