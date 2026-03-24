'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-yellow-900/50 border-yellow-700 text-yellow-200',
  confirmed: 'bg-blue-900/50 border-blue-700 text-blue-200',
  in_production: 'bg-purple-900/50 border-purple-700 text-purple-200',
  shipped: 'bg-green-900/50 border-green-700 text-green-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'in_production', 'shipped']

interface BuyerOrder {
  id: string
  buyer_company: string
  status: string
  submitted_at: string | null
  item_count: number
  total_value: number
}

export default function BuyerOrderListClient({ orders }: { orders: BuyerOrder[] }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buyer Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No buyer orders yet</h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">Orders placed by buyers through the portal will appear here.</p>
        </div>
      ) : (
        <>
          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {STATUS_FILTERS.map((status) => (
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
                  <th className="text-left px-4 py-3 font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium">Buyer</th>
                  <th className="text-left px-4 py-3 font-medium">Submitted</th>
                  <th className="text-right px-4 py-3 font-medium">Items</th>
                  <th className="text-right px-4 py-3 font-medium">Total Value</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} onClick={() => router.push(`/admin/buyer-orders/${order.id}`)} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/admin/buyer-orders/${order.id}`} className="font-medium font-mono text-neutral-200 hover:text-white transition">
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{order.buyer_company}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs tabular-nums">
                      {order.submitted_at
                        ? new Date(order.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-400">{order.item_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-400">
                      {order.total_value > 0 ? `€${order.total_value.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${STATUS_BADGES[order.status] || 'bg-neutral-800 border-neutral-700 text-neutral-300'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
