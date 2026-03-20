import { getBuyer } from '@/lib/get-buyer'
import { createServiceClient } from '@/lib/supabase/service'
import { getPendingOrderCount } from '@/lib/get-pending-order-count'
import { statusColors, statusLabels } from '@/lib/order-status'
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { supabase, buyer } = await getBuyer()
  const db = createServiceClient()

  const [
    pendingOrderCount,
    { count: totalOrders },
    { count: catalogCount },
    { data: draftOrder },
    { data: recentOrders },
  ] = await Promise.all([
    getPendingOrderCount(buyer.id),
    db
      .from('buyer_orders')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', buyer.id)
      .neq('status', 'draft'),
    supabase
      .from('buyer_product_access')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', buyer.id)
      .eq('active', true),
    db
      .from('buyer_orders')
      .select('id')
      .eq('buyer_id', buyer.id)
      .eq('status', 'draft')
      .maybeSingle(),
    db
      .from('buyer_orders')
      .select('id, status, submitted_at, buyer_order_line_items(quantity, unit_price)')
      .eq('buyer_id', buyer.id)
      .neq('status', 'draft')
      .order('submitted_at', { ascending: false })
      .limit(3),
  ])

  const stats = [
    { label: 'Total Orders', value: totalOrders ?? 0 },
    { label: 'Pending', value: pendingOrderCount },
    { label: 'Catalog Styles', value: catalogCount ?? 0 },
  ]

  const recentRows = (recentOrders ?? []).map((order: any) => {
    const items = order.buyer_order_line_items ?? []
    const total = items.reduce(
      (sum: number, li: any) => sum + (li.quantity ?? 0) * Number(li.unit_price ?? 0),
      0
    )
    return {
      id: order.id,
      status: order.status,
      submittedAt: order.submitted_at,
      total,
    }
  })

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} pendingOrderCount={pendingOrderCount} />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold">
          Welcome back, {buyer.contact_name}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {buyer.company_name}
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-5 py-4"
            >
              <p className="text-xs text-neutral-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Draft order CTA */}
        {draftOrder && (
          <Link
            href="/orders/new"
            className="mt-6 block rounded-lg border border-neutral-800 bg-neutral-900/50 px-5 py-4 hover:border-neutral-700 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">You have a draft order</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Continue editing and submit when ready.
                </p>
              </div>
              <span className="text-xs text-neutral-400">&rarr;</span>
            </div>
          </Link>
        )}

        {/* Recent orders */}
        {recentRows.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-neutral-300">Recent Orders</h2>
              <Link
                href="/orders"
                className="text-xs text-neutral-500 hover:text-foreground transition"
              >
                View all orders
              </Link>
            </div>
            <div className="rounded-lg border border-neutral-800 divide-y divide-neutral-800">
              {recentRows.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-900/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground font-mono">
                      {order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        statusColors[order.status] ?? 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-500">
                      {order.submittedAt
                        ? new Date(order.submittedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : ''}
                    </span>
                    <span className="text-sm text-foreground">€{order.total.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
