import { getBuyer } from '@/lib/get-buyer'
import { createServiceClient } from '@/lib/supabase/service'
import { getPendingOrderCount } from '@/lib/get-pending-order-count'
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DraftOrderClient from './DraftOrderClient'

export const dynamic = 'force-dynamic'

export default async function DraftOrderPage() {
  const { buyer } = await getBuyer()
  const db = createServiceClient()

  // Find the active draft
  const { data: draft } = await db
    .from('buyer_orders')
    .select('id, notes')
    .eq('buyer_id', buyer.id)
    .eq('status', 'draft')
    .single()

  if (!draft) {
    redirect('/catalog')
  }

  // Fetch line items with style and variant details
  const { data: lineItems } = await db
    .from('buyer_order_line_items')
    .select('id, quantity, unit_price, placement_notes, style_id, variant_id, styles(name), variants(size, color, sku)')
    .eq('order_id', draft.id)

  const pendingOrderCount = await getPendingOrderCount(buyer.id)

  const items = (lineItems ?? []).map((item: any) => ({
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
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} pendingOrderCount={pendingOrderCount} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold">Draft Order</h1>
          <Link
            href="/catalog"
            className="text-xs text-neutral-500 hover:text-foreground transition"
          >
            + Add more styles
          </Link>
        </div>

        <DraftOrderClient
          orderId={draft.id}
          items={items}
          initialNotes={draft.notes ?? ''}
        />
      </main>
    </div>
  )
}
