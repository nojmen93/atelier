'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/50 text-yellow-200',
  confirmed: 'bg-blue-900/50 text-blue-200',
  in_production: 'bg-purple-900/50 text-purple-200',
  shipped: 'bg-green-900/50 text-green-200',
  delivered: 'bg-emerald-900/50 text-emerald-200',
  cancelled: 'bg-red-900/50 text-red-200',
}

interface Order {
  id: string
  status: string
  submitted_at: string | null
  notes: string | null
  buyer_company: string
  buyer_contact: string
  buyer_email: string
}

interface LineItem {
  id: string
  styleName: string
  color: string
  size: string
  sku: string
  quantity: number
  unitPrice: number
  placementNotes: string
}

export default function BuyerOrderDetailClient({
  order,
  items,
}: {
  order: Order
  items: LineItem[]
}) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const orderTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const handleSaveStatus = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/buyer-orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, status }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to update status')
      } else {
        toast.success('Status updated')
        router.refresh()
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold font-mono">{order.id.slice(0, 8)}</h1>
        <span className={`px-3 py-1 text-sm rounded ${STATUS_COLORS[order.status] || ''}`}>
          {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
        </span>
      </div>

      {/* Buyer info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
        <div>
          <span className="block text-neutral-500 mb-1">Company</span>
          <span className="text-neutral-200">{order.buyer_company}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Contact</span>
          <span className="text-neutral-200">{order.buyer_contact}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Email</span>
          <span className="text-neutral-200">{order.buyer_email}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Submitted</span>
          <span className="text-neutral-200 tabular-nums">
            {order.submitted_at
              ? new Date(order.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
      </div>

      {/* Line items table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Line Items ({items.length})</h2>

        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Style</th>
                <th className="text-left px-4 py-3 font-medium">Color</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-right px-4 py-3 font-medium">Unit Price</th>
                <th className="text-right px-4 py-3 font-medium">Line Total</th>
                <th className="text-left px-4 py-3 font-medium">Placement Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-neutral-200">{item.styleName}</td>
                  <td className="px-4 py-3 text-neutral-400">{item.color || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400">{item.size || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{item.sku || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-400">
                    €{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-300">
                    €{(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs truncate max-w-[180px]">
                    {item.placementNotes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-700">
                <td colSpan={6} className="px-4 py-3 text-right text-sm font-medium text-neutral-300">
                  Order Total
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-white font-semibold">
                  €{orderTotal.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order notes */}
      {order.notes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Order Notes</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 text-sm text-neutral-300 whitespace-pre-wrap">
            {order.notes}
          </div>
        </div>
      )}

      {/* Status control */}
      <div className="border-t border-neutral-800 pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full max-w-xs px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveStatus}
          disabled={saving || status === order.status}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Status'}
        </button>
      </div>
    </>
  )
}
