'use client'

import { useState } from 'react'
import Link from 'next/link'

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
  quantity: number
  unit_price: number | null
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

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  return (
    <div>
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
              <th className="text-left px-4 py-3 font-medium">Style</th>
              <th className="text-left px-4 py-3 font-medium">Supplier</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Expected</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-neutral-200 hover:text-white transition">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-400">{order.styles?.name || '—'}</td>
                <td className="px-4 py-3 text-neutral-400">{order.suppliers?.name || order.factories?.name || '—'}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {order.quote_requests?.customer_name || '—'}
                  {order.quote_requests?.customer_company && (
                    <span className="text-neutral-600 text-xs ml-1">({order.quote_requests.customer_company})</span>
                  )}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
