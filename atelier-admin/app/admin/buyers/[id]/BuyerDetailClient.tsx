'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { useEscapeClose } from '@/lib/useKeyboardSave'

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

interface AccessRow {
  id: string
  style_id: string
  active: boolean
  price_override: number | null
  styles: { id: string; name: string } | null
}

interface Style {
  id: string
  name: string
}

interface BuyerOrder {
  id: string
  status: string
  submitted_at: string | null
  item_count: number
}

interface Buyer {
  id: string
  company_name: string
  contact_name: string
  email: string
  created_at: string
}

function AssignStylesModal({
  allStyles,
  assignedIds,
  onClose,
  onAssign,
}: {
  allStyles: Style[]
  assignedIds: Set<string>
  onClose: () => void
  onAssign: (ids: string[]) => void
}) {
  const available = allStyles.filter((s) => !assignedIds.has(s.id))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEscapeClose(onClose)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 max-w-lg w-full max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Assign Styles</h2>

        {available.length === 0 ? (
          <p className="text-neutral-500 text-sm mb-6">All styles are already assigned to this buyer.</p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1 mb-6">
            {available.map((style) => (
              <label
                key={style.id}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-900/50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selected.has(style.id)}
                  onChange={() => toggle(style.id)}
                  className="rounded border-neutral-700"
                />
                <span className="text-sm text-neutral-200">{style.name}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setLoading(true)
              onAssign(Array.from(selected))
            }}
            disabled={selected.size === 0 || loading}
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {loading ? 'Assigning...' : `Assign ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BuyerDetailClient({
  buyer,
  access,
  allStyles,
  orders,
}: {
  buyer: Buyer
  access: AccessRow[]
  allStyles: Style[]
  orders: BuyerOrder[]
}) {
  const [showAssign, setShowAssign] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const assignedIds = new Set(access.map((a) => a.style_id))

  const handleToggleActive = async (accessId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('buyer_product_access')
      .update({ active: !currentActive })
      .eq('id', accessId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(currentActive ? 'Style deactivated' : 'Style activated')
      router.refresh()
    }
  }

  const handlePriceOverride = async (accessId: string, value: string) => {
    const price = value ? parseFloat(value) : null
    const { error } = await supabase
      .from('buyer_product_access')
      .update({ price_override: price })
      .eq('id', accessId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Price updated')
    }
  }

  const handleAssign = async (styleIds: string[]) => {
    const rows = styleIds.map((style_id) => ({
      buyer_id: buyer.id,
      style_id,
      active: true,
    }))

    const { error } = await supabase.from('buyer_product_access').insert(rows)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`${styleIds.length} style(s) assigned`)
      setShowAssign(false)
      router.refresh()
    }
  }

  return (
    <>
      {/* Buyer info */}
      <h1 className="text-3xl font-bold mb-6">{buyer.company_name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 text-sm">
        <div>
          <span className="block text-neutral-500 mb-1">Contact</span>
          <span className="text-neutral-200">{buyer.contact_name}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Email</span>
          <span className="text-neutral-200">{buyer.email}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Created</span>
          <span className="text-neutral-400 tabular-nums">
            {new Date(buyer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Assigned Styles</span>
          <span className="text-neutral-200 tabular-nums">{access.length}</span>
        </div>
      </div>

      {/* Style Access */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Style Access</h2>
          <button
            onClick={() => setShowAssign(true)}
            className="px-4 py-2 text-sm bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Assign Styles
          </button>
        </div>

        {access.length === 0 ? (
          <div className="border border-neutral-800 border-dashed rounded-lg p-10 text-center">
            <p className="text-neutral-500 text-sm">No styles assigned yet. Click &ldquo;Assign Styles&rdquo; to grant access.</p>
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                  <th className="text-left px-4 py-3 font-medium">Style</th>
                  <th className="text-left px-4 py-3 font-medium">Active</th>
                  <th className="text-left px-4 py-3 font-medium">Price Override</th>
                </tr>
              </thead>
              <tbody>
                {access.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                    <td className="px-4 py-3 text-neutral-200">
                      {row.styles ? (
                        <Link href={`/admin/styles/${row.styles.id}`} className="hover:text-white transition">
                          {row.styles.name}
                        </Link>
                      ) : (
                        'Unknown'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(row.id, row.active)}
                        className={`px-3 py-1 text-xs font-medium rounded border transition ${
                          row.active
                            ? 'bg-green-900/50 border-green-700 text-green-200'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {row.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={row.price_override ?? ''}
                        onBlur={(e) => handlePriceOverride(row.id, e.target.value)}
                        placeholder="—"
                        className="w-28 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Orders</h2>

        {orders.length === 0 ? (
          <div className="border border-neutral-800 border-dashed rounded-lg p-10 text-center">
            <p className="text-neutral-500 text-sm">No orders submitted yet.</p>
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                  <th className="text-left px-4 py-3 font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium">Submitted</th>
                  <th className="text-right px-4 py-3 font-medium">Items</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/buyer-orders/${order.id}`} className="font-medium font-mono text-neutral-200 hover:text-white transition">
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs tabular-nums">
                      {order.submitted_at
                        ? new Date(order.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-400">{order.item_count}</td>
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
        )}
      </div>

      {showAssign && (
        <AssignStylesModal
          allStyles={allStyles}
          assignedIds={assignedIds}
          onClose={() => setShowAssign(false)}
          onAssign={handleAssign}
        />
      )}
    </>
  )
}
