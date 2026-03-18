import { getBuyer } from '@/lib/get-buyer'
import { createServiceClient } from '@/lib/supabase/service'
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-400',
  confirmed: 'bg-blue-900/40 text-blue-400',
  in_production: 'bg-orange-900/40 text-orange-400',
  shipped: 'bg-green-900/40 text-green-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { buyer } = await getBuyer()
  const db = createServiceClient()

  const { data: order } = await db
    .from('buyer_orders')
    .select('id, status, notes, submitted_at')
    .eq('id', params.id)
    .eq('buyer_id', buyer.id)
    .neq('status', 'draft')
    .single()

  if (!order) {
    notFound()
  }

  const { data: lineItems } = await db
    .from('buyer_order_line_items')
    .select('id, quantity, unit_price, placement_notes, styles(name), variants(size, color, sku)')
    .eq('order_id', order.id)

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

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/orders"
          className="text-xs text-neutral-500 hover:text-foreground transition"
        >
          &larr; Back to orders
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              Order {order.id.slice(0, 8)}
            </h1>
            {order.submitted_at && (
              <p className="text-xs text-neutral-500 mt-1">
                Submitted{' '}
                {new Date(order.submitted_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider self-start ${
              statusColors[order.status] ?? 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>

        {/* Buyer info */}
        <div className="mb-8 pb-6 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Buyer</p>
          <p className="text-sm">{buyer.contact_name}</p>
          <p className="text-sm text-neutral-400">{buyer.company_name}</p>
        </div>

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                <th className="text-left py-3 pr-4">Style</th>
                <th className="text-left py-3 pr-4">Color</th>
                <th className="text-left py-3 pr-4">Size</th>
                <th className="text-left py-3 pr-4 hidden sm:table-cell">SKU</th>
                <th className="text-center py-3 pr-4">Qty</th>
                <th className="text-right py-3 pr-4">Price</th>
                <th className="text-right py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-800/50">
                  <td className="py-3 pr-4">
                    <span className="text-foreground">{item.styleName}</span>
                    {item.placementNotes && (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {item.placementNotes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-neutral-400">{item.color || '—'}</td>
                  <td className="py-3 pr-4 text-neutral-400">{item.size || '—'}</td>
                  <td className="py-3 pr-4 text-neutral-500 hidden sm:table-cell">{item.sku || '—'}</td>
                  <td className="py-3 pr-4 text-center text-foreground">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right text-neutral-400">
                    €{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-foreground">
                    €{(item.unitPrice * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end border-t border-neutral-800 pt-4 mt-0">
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Order total</p>
            <p className="text-lg font-semibold mt-1">€{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-neutral-400">{order.notes}</p>
          </div>
        )}
      </main>
    </div>
  )
}
