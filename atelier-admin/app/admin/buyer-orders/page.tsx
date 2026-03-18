import { createAdminClient } from '@/lib/supabase/admin'
import BuyerOrderListClient from './BuyerOrderListClient'

export default async function BuyerOrdersPage() {
  const supabase = createAdminClient()

  const { data: orders, error } = await supabase
    .from('buyer_orders')
    .select('id, status, submitted_at, notes, buyer_id, buyers(company_name), buyer_order_line_items(id, quantity, unit_price)')
    .neq('status', 'draft')
    .order('submitted_at', { ascending: false })

  console.log('[buyer-orders] orders:', orders, 'error:', error)

  const mapped = (orders ?? []).map((o: any) => {
    const items = o.buyer_order_line_items ?? []
    return {
      id: o.id,
      buyer_company: o.buyers?.company_name ?? 'Unknown',
      status: o.status,
      submitted_at: o.submitted_at,
      item_count: items.length,
      total_value: items.reduce(
        (sum: number, i: any) => sum + (Number(i.quantity) * Number(i.unit_price ?? 0)),
        0
      ),
    }
  })

  return (
    <div>
      <BuyerOrderListClient orders={mapped} />
    </div>
  )
}
