import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import BuyerOrderDetailClient from './BuyerOrderDetailClient'

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [orderRes, itemsRes] = await Promise.all([
    supabase
      .from('buyer_orders')
      .select('id, status, submitted_at, notes, buyers(company_name, contact_name, email)')
      .eq('id', id)
      .single(),
    supabase
      .from('buyer_order_line_items')
      .select('id, quantity, unit_price, placement_notes, style_id, variant_id, styles(name), variants(size, color, sku)')
      .eq('order_id', id),
  ])

  if (!orderRes.data) {
    notFound()
  }

  const order = orderRes.data as any
  const items = (itemsRes.data ?? []).map((item: any) => ({
    id: item.id,
    styleName: item.styles?.name ?? 'Unknown',
    color: item.variants?.color ?? '',
    size: item.variants?.size ?? '',
    sku: item.variants?.sku ?? '',
    quantity: item.quantity,
    unitPrice: Number(item.unit_price ?? 0),
    placementNotes: item.placement_notes ?? '',
  }))

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/buyer-orders" label="Back to Buyer Orders" />
      <BuyerOrderDetailClient
        order={{
          id: order.id,
          status: order.status,
          submitted_at: order.submitted_at,
          notes: order.notes,
          buyer_company: order.buyers?.company_name ?? 'Unknown',
          buyer_contact: order.buyers?.contact_name ?? '',
          buyer_email: order.buyers?.email ?? '',
        }}
        items={items}
      />
    </div>
  )
}
