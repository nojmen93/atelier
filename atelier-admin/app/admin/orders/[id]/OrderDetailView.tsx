'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardSave } from '@/lib/useKeyboardSave'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-neutral-800 text-neutral-300',
  confirmed: 'bg-blue-900/50 text-blue-200',
  in_production: 'bg-yellow-900/50 text-yellow-200',
  shipped: 'bg-purple-900/50 text-purple-200',
  delivered: 'bg-green-900/50 text-green-200',
  cancelled: 'bg-red-900/50 text-red-200',
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
  actual_delivery: string | null
  notes: string | null
  created_at: string
  styles: { id: string; name: string } | null
  suppliers: { id: string; name: string } | null
  factories: { id: string; name: string } | null
  quote_requests: { id: string; customer_name: string; customer_company: string | null } | null
}

export default function OrderDetailView({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.notes || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useKeyboardSave(useCallback(() => {
    handleSave()
  }, [status, notes]))

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ status, notes: notes || null })
      .eq('id', order.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Order updated')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">{order.order_number}</h1>
        <span className={`px-3 py-1 text-sm rounded ${STATUS_COLORS[order.status] || ''}`}>
          {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 text-sm">
        <div>
          <span className="block text-neutral-500 mb-1">Style</span>
          {order.styles ? (
            <Link href={`/admin/styles/${order.styles.id}`} className="text-neutral-200 hover:text-white transition">
              {order.styles.name}
            </Link>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Supplier</span>
          {order.suppliers ? (
            <Link href={`/admin/suppliers/${order.suppliers.id}`} className="text-neutral-200 hover:text-white transition">
              {order.suppliers.name}
            </Link>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Factory</span>
          {order.factories ? (
            <Link href={`/admin/factories/${order.factories.id}`} className="text-neutral-200 hover:text-white transition">
              {order.factories.name}
            </Link>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Customer</span>
          {order.quote_requests ? (
            <Link href={`/admin/quotes/${order.quote_requests.id}`} className="text-neutral-200 hover:text-white transition">
              {order.quote_requests.customer_name}
              {order.quote_requests.customer_company && ` (${order.quote_requests.customer_company})`}
            </Link>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Quantity</span>
          <span className="text-neutral-200 tabular-nums">{order.quantity}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Total</span>
          <span className="text-neutral-200 tabular-nums">
            {order.total_price != null ? `${order.currency} ${Number(order.total_price).toFixed(2)}` : '—'}
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Order Date</span>
          <span className="text-neutral-200 tabular-nums">
            {order.order_date
              ? new Date(order.order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Expected Delivery</span>
          <span className="text-neutral-200 tabular-nums">
            {order.expected_delivery
              ? new Date(order.expected_delivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Created</span>
          <span className="text-neutral-400 tabular-nums">
            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Editable section */}
      <div className="border-t border-neutral-800 pt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
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

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  )
}
