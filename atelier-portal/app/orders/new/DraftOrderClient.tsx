'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateLineItemQuantity,
  updateLineItemNotes,
  removeLineItem,
  updateOrderNotes,
  submitOrder,
} from '@/lib/order-actions'

type LineItem = {
  id: string
  styleName: string
  color: string
  size: string
  sku: string
  quantity: number
  unitPrice: number
  placementNotes: string
}

export default function DraftOrderClient({
  orderId,
  items: initialItems,
  initialNotes,
}: {
  orderId: string
  items: LineItem[]
  initialNotes: string
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [notes, setNotes] = useState(initialNotes)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const newQty = Math.max(1, item.quantity + delta)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)))
    startTransition(async () => {
      await updateLineItemQuantity(id, newQty)
    })
  }

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(async () => {
      const result = await removeLineItem(id)
      if (result.orderDeleted) {
        router.push('/catalog')
      }
    })
  }

  const handleNotesBlur = (id: string, value: string) => {
    startTransition(async () => {
      await updateLineItemNotes(id, value)
    })
  }

  const handleOrderNotesBlur = () => {
    startTransition(async () => {
      await updateOrderNotes(orderId, notes)
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await submitOrder(orderId)
      if (result?.error) {
        setSubmitting(false)
      }
    } catch (e: any) {
      // Next.js redirect throws NEXT_REDIRECT — let it propagate
      if (e?.digest?.includes('NEXT_REDIRECT')) throw e
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400">Your draft is empty</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
              <th className="text-left py-3 pr-4">Style</th>
              <th className="text-left py-3 pr-4">Color</th>
              <th className="text-left py-3 pr-4">Size</th>
              <th className="text-left py-3 pr-4 hidden sm:table-cell">SKU</th>
              <th className="text-center py-3 pr-4">Qty</th>
              <th className="text-right py-3 pr-4">Price</th>
              <th className="text-right py-3 pr-4">Total</th>
              <th className="py-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-800/50">
                <td className="py-3 pr-4">
                  <div>
                    <span className="text-foreground">{item.styleName}</span>
                    {/* Expandable placement notes */}
                    <button
                      onClick={() => {
                        setExpandedNotes((prev) => {
                          const next = new Set(prev)
                          next.has(item.id) ? next.delete(item.id) : next.add(item.id)
                          return next
                        })
                      }}
                      className="ml-2 text-[10px] text-neutral-600 hover:text-neutral-400 transition"
                    >
                      {expandedNotes.has(item.id) ? 'hide notes' : '+ notes'}
                    </button>
                    {expandedNotes.has(item.id) && (
                      <input
                        type="text"
                        defaultValue={item.placementNotes}
                        onBlur={(e) => handleNotesBlur(item.id, e.target.value)}
                        placeholder="Placement notes..."
                        className="mt-1 block w-full text-xs bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-300 placeholder:text-neutral-700"
                      />
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-neutral-400">{item.color || '—'}</td>
                <td className="py-3 pr-4 text-neutral-400">{item.size || '—'}</td>
                <td className="py-3 pr-4 text-neutral-500 hidden sm:table-cell">{item.sku || '—'}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-6 h-6 rounded border border-neutral-700 text-neutral-400 hover:text-foreground hover:border-neutral-500 transition text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-6 h-6 rounded border border-neutral-700 text-neutral-400 hover:text-foreground hover:border-neutral-500 transition text-xs"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right text-neutral-400">
                  €{item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 pr-4 text-right text-foreground">
                  €{(item.unitPrice * item.quantity).toFixed(2)}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-neutral-600 hover:text-red-400 transition text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order total */}
      <div className="flex justify-end border-t border-neutral-800 pt-4">
        <div className="text-right">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Order total</p>
          <p className="text-lg font-semibold mt-1">€{total.toFixed(2)}</p>
        </div>
      </div>

      {/* Order notes */}
      <div>
        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
          Order notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleOrderNotesBlur}
          placeholder="Add any notes for this order..."
          rows={3}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-neutral-700 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>
    </div>
  )
}
