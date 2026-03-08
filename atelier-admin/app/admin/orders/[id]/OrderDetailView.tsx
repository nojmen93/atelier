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

const COMMON_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

interface SizeQty {
  size: string
  quantity: number
}

interface POLine {
  id: string
  purchase_order_id: string
  style_id: string | null
  style_name: string | null
  color: string | null
  sku: string | null
  size_breakdown: SizeQty[]
  quantity: number
  unit_price: number | null
  line_total: number | null
  notes: string | null
  sort_order: number
  styles?: { id: string; name: string; images: string[] | null; suppliers: { name: string } | null } | null
}

interface PurchaseOrder {
  id: string
  order_id: string
  po_number: string | null
  supplier_id: string | null
  factory_id: string | null
  expected_delivery: string | null
  notes: string | null
  sort_order: number
  suppliers?: { id: string; name: string } | null
  po_lines: POLine[]
}

interface Order {
  id: string
  order_number: string
  customer_name: string | null
  customer_company: string | null
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

interface EditableLineData {
  sizeBreakdown: { size: string; quantity: string }[]
  notes: string
}

export default function OrderDetailView({ order, purchaseOrders }: { order: Order; purchaseOrders: PurchaseOrder[] }) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.notes || '')
  const [saving, setSaving] = useState(false)
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [editableLines, setEditableLines] = useState<Record<string, EditableLineData>>({})
  const router = useRouter()
  const supabase = createClient()

  const customerName = order.customer_name || order.quote_requests?.customer_name || null
  const customerCompany = order.customer_company || order.quote_requests?.customer_company || null

  const totalPOQty = purchaseOrders.reduce(
    (sum, po) => sum + po.po_lines.reduce((s, l) => s + l.quantity, 0), 0
  )

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

  const startEditLine = (line: POLine) => {
    setEditingLine(line.id)
    const breakdown = Array.isArray(line.size_breakdown)
      ? line.size_breakdown.map((s) => ({ size: s.size, quantity: String(s.quantity) }))
      : []
    setEditableLines((prev) => ({
      ...prev,
      [line.id]: { sizeBreakdown: breakdown, notes: line.notes || '' },
    }))
  }

  const saveLine = async (lineId: string) => {
    const editable = editableLines[lineId]
    if (!editable) return

    const sizeBreakdown = editable.sizeBreakdown
      .filter((s) => s.size)
      .map((s) => ({ size: s.size, quantity: parseInt(s.quantity) || 0 }))
    const totalQty = sizeBreakdown.reduce((sum, s) => sum + s.quantity, 0)

    const { error } = await supabase
      .from('po_lines')
      .update({
        size_breakdown: sizeBreakdown,
        quantity: totalQty,
        notes: editable.notes || null,
      })
      .eq('id', lineId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Line updated')
      setEditingLine(null)
      router.refresh()
    }
  }

  const updateEditable = (lineId: string, updates: Partial<EditableLineData>) => {
    setEditableLines((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], ...updates },
    }))
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
          <span className="block text-neutral-500 mb-1">Customer</span>
          {customerName ? (
            <span className="text-neutral-200">
              {customerName}
              {customerCompany && <span className="text-neutral-500 ml-1">({customerCompany})</span>}
            </span>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Total Quantity</span>
          <span className="text-neutral-200 tabular-nums">{totalPOQty || order.quantity}</span>
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

      {/* Purchase Orders */}
      {purchaseOrders.length > 0 && (
        <div className="mb-8 space-y-6">
          <h2 className="text-lg font-semibold">Purchase Orders ({purchaseOrders.length})</h2>

          {purchaseOrders.map((po) => {
            const poQty = po.po_lines.reduce((s, l) => s + l.quantity, 0)
            const supplierName = po.suppliers?.name || 'No supplier'

            return (
              <div key={po.id} className="border border-neutral-800 rounded-lg overflow-hidden">
                {/* PO Header */}
                <div className="bg-neutral-900/50 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white font-mono">{po.po_number || 'PO'}</span>
                    {po.suppliers && (
                      <Link href={`/admin/suppliers/${po.suppliers.id}`} className="text-xs text-neutral-400 hover:text-white transition">
                        {supplierName}
                      </Link>
                    )}
                    {!po.suppliers && <span className="text-xs text-neutral-500">{supplierName}</span>}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {po.po_lines.length} product{po.po_lines.length !== 1 ? 's' : ''} · {poQty} pcs
                  </span>
                </div>

                {/* PO Lines Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                      <th className="text-left px-4 py-2 font-medium">Product</th>
                      <th className="text-left px-4 py-2 font-medium">Sizes</th>
                      <th className="text-right px-4 py-2 font-medium">Qty</th>
                      <th className="text-left px-4 py-2 font-medium">Notes</th>
                      <th className="text-right px-4 py-2 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.po_lines.map((line) => {
                      const isEditing = editingLine === line.id
                      const editable = editableLines[line.id]
                      const sizeDisplay = Array.isArray(line.size_breakdown)
                        ? line.size_breakdown.map((s) => `${s.size}: ${s.quantity}`).join(', ')
                        : '—'

                      if (isEditing && editable) {
                        return (
                          <tr key={line.id} className="border-b border-neutral-800 last:border-b-0">
                            <td className="px-4 py-3" colSpan={5}>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  {line.styles?.images?.[0] && (
                                    <img src={line.styles.images[0]} alt="" className="w-7 h-7 rounded object-cover bg-neutral-800" />
                                  )}
                                  <span className="font-medium text-white text-sm">{line.style_name || line.styles?.name || '—'}</span>
                                </div>

                                {/* Size breakdown editor */}
                                <div>
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {COMMON_SIZES.map((size) => {
                                      const exists = editable.sizeBreakdown.some((s) => s.size === size)
                                      return (
                                        <button
                                          key={size}
                                          type="button"
                                          onClick={() => {
                                            const newBreakdown = exists
                                              ? editable.sizeBreakdown.filter((s) => s.size !== size)
                                              : [...editable.sizeBreakdown, { size, quantity: '' }]
                                            updateEditable(line.id, { sizeBreakdown: newBreakdown })
                                          }}
                                          className={`px-3 py-1 text-xs font-medium rounded border transition ${
                                            exists
                                              ? 'bg-white text-black border-white'
                                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                                          }`}
                                        >
                                          {size}
                                        </button>
                                      )
                                    })}
                                  </div>
                                  {editable.sizeBreakdown.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {editable.sizeBreakdown.map((sz, szIdx) => (
                                        <div key={sz.size} className="flex items-center gap-1">
                                          <span className="text-xs text-neutral-400 w-8">{sz.size}</span>
                                          <input
                                            type="number"
                                            value={sz.quantity}
                                            onChange={(e) => {
                                              const newBreakdown = [...editable.sizeBreakdown]
                                              newBreakdown[szIdx] = { ...sz, quantity: e.target.value }
                                              updateEditable(line.id, { sizeBreakdown: newBreakdown })
                                            }}
                                            placeholder="0"
                                            min="0"
                                            className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-sm text-center focus:border-neutral-600 focus:outline-none"
                                          />
                                        </div>
                                      ))}
                                      <span className="flex items-center text-xs text-neutral-500 ml-2">
                                        = {editable.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)} pcs
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    value={editable.notes}
                                    onChange={(e) => updateEditable(line.id, { notes: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                                    placeholder="Notes..."
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveLine(line.id)}
                                    className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingLine(null)}
                                    className="px-4 py-1.5 text-neutral-400 text-xs hover:text-white transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={line.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {line.styles?.images?.[0] && (
                                <img src={line.styles.images[0]} alt="" className="w-6 h-6 rounded object-cover bg-neutral-800" />
                              )}
                              {line.style_id ? (
                                <Link href={`/admin/styles/${line.style_id}`} className="text-neutral-200 hover:text-white transition text-sm">
                                  {line.style_name || line.styles?.name || '—'}
                                </Link>
                              ) : (
                                <span className="text-neutral-400 text-sm">{line.style_name || '—'}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-neutral-400 text-xs">{sizeDisplay}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-neutral-300">{line.quantity}</td>
                          <td className="px-4 py-2.5 text-neutral-500 text-xs truncate max-w-[180px]">{line.notes || '—'}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => startEditLine(line)}
                              className="text-xs text-neutral-500 hover:text-white transition"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}

      {/* Editable order section */}
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
