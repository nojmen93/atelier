import { getBuyer } from '@/lib/get-buyer'
import { createServiceClient } from '@/lib/supabase/service'
import TopNav from '@/components/TopNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  pending: 'bg-neutral-800 text-neutral-400',
  confirmed: 'bg-blue-900/40 text-blue-400',
  in_production: 'bg-orange-900/40 text-orange-400',
  shipped: 'bg-green-900/40 text-green-400',
  delivered: 'bg-emerald-900/40 text-emerald-400',
  cancelled: 'bg-red-900/40 text-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function DashboardPage() {
  const { buyer } = await getBuyer()
  const db = createServiceClient()

  const [
    { count: totalOrders },
    { count: activeOrders },
    { count: stylesCount },
    { data: recentOrdersRaw },
  ] = await Promise.all([
    db.from('buyer_orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyer.id).neq('status', 'draft'),
    db.from('buyer_orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyer.id).in('status', ['confirmed', 'in_production', 'shipped']),
    db.from('buyer_product_access').select('*', { count: 'exact', head: true }).eq('buyer_id', buyer.id),
    db.from('buyer_orders')
      .select('id, status, submitted_at, buyer_order_line_items(quantity, unit_price)')
      .eq('buyer_id', buyer.id)
      .neq('status', 'draft')
      .order('submitted_at', { ascending: false })
      .limit(3),
  ])

  const recentOrders = (recentOrdersRaw ?? []).map((order: any) => {
    const items = order.buyer_order_line_items ?? []
    const itemCount = items.reduce((sum: number, li: any) => sum + (li.quantity ?? 0), 0)
    const totalValue = items.reduce(
      (sum: number, li: any) => sum + (li.quantity ?? 0) * Number(li.unit_price ?? 0),
      0
    )
    return { id: order.id, status: order.status, submittedAt: order.submitted_at, itemCount, totalValue }
  })

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold">Welcome back, {buyer.contact_name}</h1>
        <p className="mt-1 mb-10 text-sm text-neutral-400">{buyer.company_name}</p>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{totalOrders ?? 0}</div>
            <div className="text-sm text-neutral-400">Orders Submitted</div>
          </div>
          <div className="border border-blue-900/50 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1 text-blue-300">{activeOrders ?? 0}</div>
            <div className="text-sm text-neutral-400">Active Orders</div>
          </div>
          <div className="border border-neutral-800 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stylesCount ?? 0}</div>
            <div className="text-sm text-neutral-400">Styles Available</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-neutral-400 hover:text-white transition">
            View all orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No orders yet —{' '}
            <Link href="/catalog" className="text-white hover:underline">
              browse the catalog to get started.
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-center px-4 py-3">Items</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="text-foreground hover:underline">
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {order.submittedAt
                        ? new Date(order.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-400">{order.itemCount}</td>
                    <td className="px-4 py-3 text-right">€{order.totalValue.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[order.status] ?? 'bg-neutral-800 text-neutral-400'}`}>
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
