import { createClient } from '@/lib/supabase/server'
import QuoteList from './QuoteList'
import QuoteEmptyState from './QuoteEmptyState'

export default async function QuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('*, styles(name, images)')
    .order('created_at', { ascending: false })

  if (!quotes || quotes.length === 0) {
    return <QuoteEmptyState />
  }

  return <QuoteList initialQuotes={quotes} />
}
