import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import BuyerDetailClient from './BuyerDetailClient'

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [buyerRes, accessRes, allStylesRes, ordersRes] = await Promise.all([
    supabase.from('buyers').select('*').eq('id', id).single(),
    supabase
      .from('buyer_product_access')
      .select('id, style_id, active, price_override, styles(id, name)')
      .eq('buyer_id', id),
    supabase.from('styles').select('id, name').order('name'),
    supabase
      .from('buyer_orders')
      .select('id, status, submitted_at, buyer_order_line_items(id)')
      .eq('buyer_id', id)
      .neq('status', 'draft')
      .order('submitted_at', { ascending: false }),
  ])

  if (!buyerRes.data) {
    notFound()
  }

  const orders = (ordersRes.data ?? []).map((o: any) => ({
    id: o.id,
    status: o.status,
    submitted_at: o.submitted_at,
    item_count: o.buyer_order_line_items?.length ?? 0,
  }))

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/buyers" label="Back to Buyers" />
      <BuyerDetailClient
        buyer={buyerRes.data}
        access={(accessRes.data ?? []) as any}
        allStyles={(allStylesRes.data ?? []) as any}
        orders={orders}
      />
    </div>
  )
}
