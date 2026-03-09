'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const NewOrderModal = dynamic(() => import('@/components/NewOrderModal'), { ssr: false })

const STATUS_BADGES: Record<string, string> = {
  draft: 'bg-neutral-800 border-neutral-700 text-neutral-300',
  confirmed: 'bg-blue-900/50 border-blue-700 text-blue-200',
  in_production: 'bg-yellow-900/50 border-yellow-700 text-yellow-200',
  shipped: 'bg-purple-900/50 border-purple-700 text-purple-200',
  delivered: 'bg-green-900/50 border-green-700 text-green-200',
  cancelled: 'bg-red-900/50 border-red-700 text-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

interface Order {
  id: string
  order_number: string
  customer_name: string | null
  customer_company: string | null
  quantity: number
  total_price: number | null
  currency: string
  status: string
  order_date: string | null
  expected_delivery: string | null
  created_at: string
  styles: { name: string } | null
  suppliers: { name: string } | null
  factories: { name: string } | null
  quote_requests: { customer_name: string; customer_company: string | null } | null
}

export default function OrderList({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const getCustomerDisplay = (order: Order): string => {
    if (order.customer_name) return order.customer_name
    if (order.quote_requests?.customer_name) return order.quote_requests.customer_name
    return '—'
  }

  const getCompanyDisplay = (order: Order): string | null => {
    if (order.customer_company) return order.customer_company
    if (order.quote_requests?.customer_company) return order.quote_requests.customer_company
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No orders yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Create production orders to track manufacturing from quote to delivery.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Create First Order
          </button>
        </div>
      ) : (
        <>
          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'draft', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs rounded border transition ${
                  statusFilter === status
                    ? 'bg-white text-black border-white'
                    : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>

          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                  <th className="text-left px-4 py-3 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Style</th>
                  <th className="text-left px-4 py-3 font-medium">Supplier</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Expected</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const customer = getCustomerDisplay(order)
                  const company = getCompanyDisplay(order)

                  return (
                    <tr key={order.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-neutral-200 hover:text-white transition">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {customer}
                        {company && <span className="text-neutral-600 text-xs ml-1">({company})</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{order.styles?.name || '—'}</td>
                      <td className="px-4 py-3 text-neutral-400">{order.suppliers?.name || order.factories?.name || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-neutral-400">{order.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-neutral-400">
                        {order.total_price != null ? `${order.currency} ${Number(order.total_price).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${STATUS_BADGES[order.status] || ''}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs tabular-nums">
                        {order.expected_delivery
                          ? new Date(order.expected_delivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onOrderCreated={() => router.refresh()}
        />
      )}
    </div>
  )
}
