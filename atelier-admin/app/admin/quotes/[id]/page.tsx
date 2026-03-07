import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import QuoteDetailView from './QuoteDetailView'

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: quote }, { data: styles }, { data: concepts }, { data: suppliers }, { data: logos }] = await Promise.all([
    supabase
      .from('quote_requests')
      .select('*, styles(id, name, images, base_cost, lead_time_days, material, description)')
      .eq('id', id)
      .single(),
    supabase
      .from('styles')
      .select('id, name')
      .neq('status', 'archived')
      .order('name'),
    supabase
      .from('concepts')
      .select('id, name, categories(id, name)')
      .order('display_order', { ascending: true }),
    supabase
      .from('suppliers')
      .select('id, name')
      .order('name'),
    supabase
      .from('logos')
      .select('id, company_name, file_url, file_format')
      .order('company_name'),
  ])

  if (!quote) {
    notFound()
  }

  return (
    <div>
      <BackLink href="/admin/quotes" label="Back to Quotes" />
      <QuoteDetailView
        quote={quote}
        styles={styles || []}
        concepts={concepts || []}
        suppliers={suppliers || []}
        logos={logos || []}
      />
    </div>
  )
}
