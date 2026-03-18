import { getBuyer } from '@/lib/get-buyer'
import { createServiceClient } from '@/lib/supabase/service'
import TopNav from '@/components/TopNav'
import Link from 'next/link'

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

export default async function OrdersPage() {
  const { buyer } = await getBuyer()
  const db = createServiceClient()

  const { data: orders } = await db
    .from('buyer_orders')
    .select('id, status, notes, submitted_at, buyer_order_line_items(quantity, unit_price)')
    .eq('buyer_id', buyer.id)
    .neq('status', 'draft')
    .order('submitted_at', { ascending: false })

  const orderRows = (orders ?? []).map((order: any) => {
    const items = order.buyer_order_line_items ?? []
    const itemCount = items.reduce((sum: number, li: any) => sum + (li.quantity ?? 0), 0)
    const totalValue = items.reduce(
      (sum: number, li: any) => sum + (li.quantity ?? 0) * Number(li.unit_price ?? 0),
      0
    )
    return {
      id: order.id,
      status: order.status,
      submittedAt: order.submitted_at,
      itemCount,
      totalValue,
    }
  })

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-8">Orders</h1>

        {orderRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg text-neutral-300">No orders submitted yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Orders will appear here after you submit them from the catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-3 pr-4">Order</th>
                  <th className="text-left py-3 pr-4">Submitted</th>
                  <th className="text-center py-3 pr-4">Items</th>
                  <th className="text-right py-3 pr-4">Total</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-800/50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-foreground hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-neutral-400">
                      {order.submittedAt
                        ? new Date(order.submittedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 text-center text-neutral-400">
                      {order.itemCount}
                    </td>
                    <td className="py-3 pr-4 text-right text-foreground">
                      €{order.totalValue.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          statusColors[order.status] ?? 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
