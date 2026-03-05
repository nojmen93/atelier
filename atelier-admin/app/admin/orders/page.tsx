import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import OrderList from './OrderList'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, styles(name), suppliers(name), factories(name), quote_requests(customer_name, customer_company)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Link
          href="/admin/orders/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Order
        </Link>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No orders yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Create production orders to track manufacturing from quote to delivery.</p>
          <Link
            href="/admin/orders/new"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Create First Order
          </Link>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  )
}
