'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useEscapeClose } from '@/lib/useKeyboardSave'

// ─── Types ───────────────────────────────────────────────────────────

interface Style {
  id: string
  name: string
  images: string[] | null
  base_cost: number | null
  material: string | null
  gender: string
  status: string
  category_id: string | null
  concept_id: string | null
  supplier_id: string | null
  categories?: { name: string } | null
  concepts?: { name: string } | null
  suppliers?: { id: string; name: string } | null
}

interface SizeQty {
  size: string
  quantity: string
}

interface POLineData {
  styleId: string
  styleName: string
  styleImage: string | null
  supplierId: string | null
  supplierName: string | null
  sizeBreakdown: SizeQty[]
  quantity: number
  notes: string
}

type ModalStep = 'customer_info' | 'select_styles' | 'fill_lines' | 'done'
type StyleViewMode = 'dropdown' | 'grid' | 'gallery'

const COMMON_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

// ─── Order Number Generation ─────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `ORD-${yy}${mm}-${rand}`
}

function generatePONumber(orderNumber: string, index: number): string {
  const suffix = String.fromCharCode(65 + index) // A, B, C...
  return `${orderNumber}-${suffix}`
}

// ─── Step 1: Customer & Order Info ───────────────────────────────────

function CustomerOrderForm({
  customerName,
  customerCompany,
  orderNumber,
  onChangeCustomerName,
  onChangeCustomerCompany,
  existingCustomers,
  onConfirm,
  onCancel,
}: {
  customerName: string
  customerCompany: string
  orderNumber: string
  onChangeCustomerName: (v: string) => void
  onChangeCustomerCompany: (v: string) => void
  existingCustomers: { name: string; company: string | null }[]
  onConfirm: () => void
  onCancel: () => void
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputClass = 'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  const suggestions = useMemo(() => {
    if (!customerName.trim()) return []
    const q = customerName.toLowerCase()
    return existingCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q))
    ).slice(0, 6)
  }, [customerName, existingCustomers])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">New Order</h3>
        <p className="text-sm text-neutral-500 mt-1">Enter customer details to get started.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs text-neutral-500 mb-1">Customer Name *</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => { onChangeCustomerName(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={inputClass}
            placeholder="Type customer name..."
            autoFocus
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-800 transition"
                  onMouseDown={() => {
                    onChangeCustomerName(s.name)
                    if (s.company) onChangeCustomerCompany(s.company)
                    setShowSuggestions(false)
                  }}
                >
                  <span className="text-white">{s.name}</span>
                  {s.company && <span className="text-neutral-500 ml-2 text-xs">({s.company})</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Company</label>
          <input
            type="text"
            value={customerCompany}
            onChange={(e) => onChangeCustomerCompany(e.target.value)}
            className={inputClass}
            placeholder="Company name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Order Number</label>
          <input
            type="text"
            value={orderNumber}
            disabled
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
          <p className="text-[10px] text-neutral-600 mt-1">Auto-generated</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!customerName.trim()}
          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Select Products
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Style Selector ──────────────────────────────────────────

function StyleSelector({
  styles,
  selectedIds,
  onToggle,
  onConfirm,
  onCancel,
}: {
  styles: Style[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const [viewMode, setViewMode] = useState<StyleViewMode>('grid')
  const [search, setSearch] = useState('')
  const [conceptFilter, setConceptFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const concepts = useMemo(() => {
    const map = new Map<string, string>()
    styles.forEach((s) => {
      if (s.concepts?.name && s.concept_id) map.set(s.concept_id, s.concepts.name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [styles])

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    styles.forEach((s) => {
      if (s.categories?.name && s.category_id) {
        if (!conceptFilter || s.concept_id === conceptFilter) {
          map.set(s.category_id, s.categories.name)
        }
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [styles, conceptFilter])

  const filtered = useMemo(() => {
    return styles.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (conceptFilter && s.concept_id !== conceptFilter) return false
      if (categoryFilter && s.category_id !== categoryFilter) return false
      return true
    })
  }, [styles, search, conceptFilter, categoryFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Products</h3>
        <div className="flex gap-1 bg-neutral-900 rounded p-0.5">
          {(['dropdown', 'grid', 'gallery'] as StyleViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                viewMode === mode
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {mode === 'dropdown' ? 'List' : mode === 'grid' ? 'Grid' : 'Gallery'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search styles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
        />
        <select
          value={conceptFilter}
          onChange={(e) => { setConceptFilter(e.target.value); setCategoryFilter('') }}
          className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
        >
          <option value="">All Concepts</option>
          {concepts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-neutral-500">
        {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
        {filtered.length !== styles.length && ` · ${filtered.length} of ${styles.length} shown`}
      </p>

      {/* List view */}
      {viewMode === 'dropdown' && (
        <div className="border border-neutral-800 rounded-lg max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-500 text-sm">No styles found</div>
          ) : (
            filtered.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900/50 cursor-pointer border-b border-neutral-800/50 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(s.id)}
                  onChange={() => onToggle(s.id)}
                  className="accent-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.name}</div>
                  <div className="text-xs text-neutral-500">
                    {[s.concepts?.name, s.categories?.name].filter(Boolean).join(' / ')}
                    {s.suppliers?.name && ` · ${s.suppliers.name}`}
                  </div>
                </div>
                {s.images?.[0] && (
                  <img src={s.images[0]} alt="" className="w-8 h-8 rounded object-cover bg-neutral-800 flex-shrink-0" />
                )}
              </label>
            ))
          )}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => onToggle(s.id)}
              className={`relative border rounded-lg overflow-hidden cursor-pointer transition ${
                selectedIds.has(s.id)
                  ? 'border-white ring-1 ring-white/20'
                  : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => onToggle(s.id)}
                className="absolute top-2 right-2 z-10 accent-white"
              />
              {s.images?.[0] ? (
                <img src={s.images[0]} alt="" className="w-full aspect-[3/4] object-cover bg-neutral-800" />
              ) : (
                <div className="w-full aspect-[3/4] bg-neutral-900 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              <div className="p-3">
                <div className="text-sm font-medium text-white truncate">{s.name}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {s.categories?.name && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded">{s.categories.name}</span>
                  )}
                  {s.suppliers?.name && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded">{s.suppliers.name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery view */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {filtered.map((s) => (
            <label
              key={s.id}
              className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition ${
                selectedIds.has(s.id)
                  ? 'border-white bg-neutral-800/50'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(s.id)}
                onChange={() => onToggle(s.id)}
                className="mt-1 accent-white flex-shrink-0"
              />
              {s.images?.[0] ? (
                <img src={s.images[0]} alt="" className="w-20 h-20 rounded object-cover bg-neutral-800 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded bg-neutral-800 flex-shrink-0 flex items-center justify-center text-neutral-600 text-xs">
                  No img
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{s.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {[s.concepts?.name, s.categories?.name].filter(Boolean).join(' / ')}
                </div>
                {s.suppliers?.name && <div className="text-xs text-neutral-600 mt-0.5">{s.suppliers.name}</div>}
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={selectedIds.size === 0}
          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue with {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: PO Lines grouped by Supplier ────────────────────────────

interface POGroup {
  supplierId: string | null
  supplierName: string
  lines: POLineData[]
}

function POLinesEditor({
  groups,
  onUpdateLine,
  onRemoveLine,
  onSaveOrder,
  onSaveAndGo,
  onCancel,
  saving,
}: {
  groups: POGroup[]
  onUpdateLine: (supplierId: string | null, lineIdx: number, line: POLineData) => void
  onRemoveLine: (supplierId: string | null, lineIdx: number) => void
  onSaveOrder: () => void
  onSaveAndGo: () => void
  onCancel: () => void
  saving: boolean
}) {
  const totalQty = groups.reduce((sum, g) => sum + g.lines.reduce((s, l) => s + l.quantity, 0), 0)
  const totalLines = groups.reduce((sum, g) => sum + g.lines.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Purchase Orders</h3>
        <span className="text-xs text-neutral-500">
          {groups.length} PO{groups.length !== 1 ? 's' : ''} · {totalLines} line{totalLines !== 1 ? 's' : ''} · {totalQty} units
        </span>
      </div>

      <p className="text-xs text-neutral-500">
        Products are grouped by supplier. Each group becomes a separate PO.
      </p>

      <div className="space-y-6 max-h-[55vh] overflow-y-auto">
        {groups.map((group, groupIdx) => (
          <div key={group.supplierId || 'no-supplier'} className="border border-neutral-800 rounded-lg overflow-hidden">
            {/* PO header */}
            <div className="bg-neutral-900/50 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white">
                  PO {String.fromCharCode(65 + groupIdx)}
                </span>
                <span className="text-xs text-neutral-500 ml-3">
                  {group.supplierName}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {group.lines.length} product{group.lines.length !== 1 ? 's' : ''} ·{' '}
                {group.lines.reduce((s, l) => s + l.quantity, 0)} pcs
              </span>
            </div>

            {/* Lines within PO */}
            <div className="divide-y divide-neutral-800/50">
              {group.lines.map((line, lineIdx) => {
                const lineQty = line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)

                return (
                  <div key={line.styleId} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {line.styleImage ? (
                        <img src={line.styleImage} alt="" className="w-10 h-10 rounded object-cover bg-neutral-800 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{line.styleName}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveLine(group.supplierId, lineIdx)}
                        className="px-2 py-1 text-neutral-500 hover:text-red-400 transition text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Size breakdown */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-2">Size Breakdown</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {COMMON_SIZES.map((size) => {
                          const exists = line.sizeBreakdown.some((s) => s.size === size)
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const newBreakdown = exists
                                  ? line.sizeBreakdown.filter((s) => s.size !== size)
                                  : [...line.sizeBreakdown, { size, quantity: '' }]
                                const newQty = newBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)
                                onUpdateLine(group.supplierId, lineIdx, { ...line, sizeBreakdown: newBreakdown, quantity: newQty })
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
                      {line.sizeBreakdown.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {line.sizeBreakdown.map((sz, szIdx) => (
                            <div key={sz.size} className="flex items-center gap-1">
                              <span className="text-xs text-neutral-400 w-8">{sz.size}</span>
                              <input
                                type="number"
                                value={sz.quantity}
                                onChange={(e) => {
                                  const newBreakdown = [...line.sizeBreakdown]
                                  newBreakdown[szIdx] = { ...sz, quantity: e.target.value }
                                  const newQty = newBreakdown.reduce((s, szz) => s + (parseInt(szz.quantity) || 0), 0)
                                  onUpdateLine(group.supplierId, lineIdx, { ...line, sizeBreakdown: newBreakdown, quantity: newQty })
                                }}
                                placeholder="0"
                                min="0"
                                className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-sm text-center focus:border-neutral-600 focus:outline-none"
                              />
                            </div>
                          ))}
                          <span className="flex items-center text-xs text-neutral-500 ml-2">
                            = {lineQty} pcs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={line.notes}
                        onChange={(e) => onUpdateLine(group.supplierId, lineIdx, { ...line, notes: e.target.value })}
                        placeholder="Optional notes..."
                        className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
        >
          Back to Products
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveOrder}
            disabled={saving || totalQty === 0}
            className="px-6 py-2.5 border border-neutral-700 text-white text-sm font-medium rounded hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            type="button"
            onClick={onSaveAndGo}
            disabled={saving || totalQty === 0}
            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save & Go to Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────

export default function NewOrderModal({
  onClose,
  onOrderCreated,
}: {
  onClose: () => void
  onOrderCreated: () => void
}) {
  const [step, setStep] = useState<ModalStep>('customer_info')
  const [styles, setStyles] = useState<Style[]>([])
  const [existingCustomers, setExistingCustomers] = useState<{ name: string; company: string | null }[]>([])
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<string>>(new Set())
  const [linesBySupplier, setLinesBySupplier] = useState<Record<string, POLineData[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [orderNumber] = useState(generateOrderNumber)

  const supabase = createClient()
  const router = useRouter()

  useEscapeClose(onClose)

  // Load reference data
  useEffect(() => {
    Promise.all([
      supabase
        .from('styles')
        .select('id, name, images, base_cost, material, gender, status, category_id, concept_id, supplier_id, categories(name), concepts(name), suppliers(id, name)')
        .neq('status', 'archived')
        .order('name'),
      supabase
        .from('quote_requests')
        .select('customer_name, customer_company')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('orders')
        .select('customer_name, customer_company')
        .not('customer_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100),
    ]).then(([stylesRes, quoteCustomersRes, orderCustomersRes]) => {
      if (stylesRes.data) {
        const normalized = (stylesRes.data as Record<string, unknown>[]).map((s) => ({
          ...s,
          categories: Array.isArray(s.categories) ? s.categories[0] || null : s.categories,
          concepts: Array.isArray(s.concepts) ? s.concepts[0] || null : s.concepts,
          suppliers: Array.isArray(s.suppliers) ? s.suppliers[0] || null : s.suppliers,
        }))
        setStyles(normalized as Style[])
      }

      const seen = new Set<string>()
      const customers: { name: string; company: string | null }[] = []
      const allCustomers = [
        ...(quoteCustomersRes.data || []).map((q: { customer_name: string; customer_company: string | null }) => ({ name: q.customer_name, company: q.customer_company })),
        ...(orderCustomersRes.data || []).map((o: { customer_name: string | null; customer_company: string | null }) => ({ name: o.customer_name || '', company: o.customer_company })),
      ]
      for (const c of allCustomers) {
        if (c.name && !seen.has(c.name.toLowerCase())) {
          seen.add(c.name.toLowerCase())
          customers.push(c)
        }
      }
      setExistingCustomers(customers)
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStyle = (id: string) => {
    setSelectedStyleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Group selected styles by supplier and initialize lines
  const handleConfirmSelection = () => {
    if (selectedStyleIds.size === 0) return

    const grouped: Record<string, POLineData[]> = {}

    for (const styleId of selectedStyleIds) {
      const style = styles.find((s) => s.id === styleId)
      if (!style) continue

      const key = style.supplier_id || 'no-supplier'

      // Preserve existing line data if already filled
      const existingLines = linesBySupplier[key] || []
      const existingLine = existingLines.find((l) => l.styleId === styleId)

      if (!grouped[key]) grouped[key] = []
      grouped[key].push(existingLine || {
        styleId: style.id,
        styleName: style.name,
        styleImage: style.images?.[0] || null,
        supplierId: style.supplier_id,
        supplierName: style.suppliers?.name || null,
        sizeBreakdown: [],
        quantity: 0,
        notes: '',
      })
    }

    setLinesBySupplier(grouped)
    setStep('fill_lines')
  }

  // Build POGroup array for the editor
  const poGroups: POGroup[] = useMemo(() => {
    return Object.entries(linesBySupplier).map(([key, lines]) => ({
      supplierId: key === 'no-supplier' ? null : key,
      supplierName: lines[0]?.supplierName || 'No supplier assigned',
      lines,
    }))
  }, [linesBySupplier])

  const handleUpdateLine = (supplierId: string | null, lineIdx: number, line: POLineData) => {
    const key = supplierId || 'no-supplier'
    setLinesBySupplier((prev) => ({
      ...prev,
      [key]: prev[key].map((l, i) => i === lineIdx ? line : l),
    }))
  }

  const handleRemoveLine = (supplierId: string | null, lineIdx: number) => {
    const key = supplierId || 'no-supplier'
    const line = linesBySupplier[key]?.[lineIdx]
    if (!line) return

    setSelectedStyleIds((prev) => {
      const next = new Set(prev)
      next.delete(line.styleId)
      return next
    })

    setLinesBySupplier((prev) => {
      const updated = { ...prev }
      updated[key] = updated[key].filter((_, i) => i !== lineIdx)
      if (updated[key].length === 0) delete updated[key]
      return updated
    })
  }

  const saveOrder = async (navigateToOrder: boolean) => {
    setSaving(true)

    const allLines = Object.values(linesBySupplier).flat()
    const totalQty = allLines.reduce((sum, l) => sum + l.quantity, 0)

    // Build PO payloads
    const purchaseOrders = Object.entries(linesBySupplier).map(([key, lines], poIdx) => {
      const supplierId = key === 'no-supplier' ? null : key
      return {
        po_number: generatePONumber(orderNumber, poIdx),
        supplier_id: supplierId,
        sort_order: poIdx,
        lines: lines.map((line, idx) => ({
          style_id: line.styleId,
          style_name: line.styleName,
          size_breakdown: line.sizeBreakdown
            .filter((s) => s.size)
            .map((s) => ({ size: s.size, quantity: parseInt(s.quantity) || 0 })),
          quantity: line.quantity,
          notes: line.notes || null,
          sort_order: idx,
        })),
      }
    })

    // Use API route (admin client) to bypass RLS
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          order_number: orderNumber,
          customer_name: customerName.trim() || null,
          customer_company: customerCompany.trim() || null,
          quantity: totalQty,
          currency: 'EUR',
          order_date: new Date().toISOString().split('T')[0],
          status: 'draft',
        },
        purchaseOrders,
      }),
    })

    const result = await res.json()

    if (!res.ok || result.error) {
      toast.error(result.error || 'Failed to create order')
      setSaving(false)
      return
    }

    const poCount = result.purchase_orders?.length || 0
    toast.success(`Order ${orderNumber} created with ${poCount} PO${poCount !== 1 ? 's' : ''}`)
    onOrderCreated()
    setSaving(false)

    if (navigateToOrder) {
      onClose()
      router.push(`/admin/orders/${result.id}`)
    } else {
      onClose()
      router.push('/admin/orders')
      router.refresh()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-neutral-500 text-sm">Loading...</div>
          </div>
        ) : step === 'customer_info' ? (
          <CustomerOrderForm
            customerName={customerName}
            customerCompany={customerCompany}
            orderNumber={orderNumber}
            onChangeCustomerName={setCustomerName}
            onChangeCustomerCompany={setCustomerCompany}
            existingCustomers={existingCustomers}
            onConfirm={() => setStep('select_styles')}
            onCancel={onClose}
          />
        ) : step === 'select_styles' ? (
          <StyleSelector
            styles={styles}
            selectedIds={selectedStyleIds}
            onToggle={toggleStyle}
            onConfirm={handleConfirmSelection}
            onCancel={() => setStep('customer_info')}
          />
        ) : step === 'fill_lines' ? (
          <POLinesEditor
            groups={poGroups}
            onUpdateLine={handleUpdateLine}
            onRemoveLine={handleRemoveLine}
            onSaveOrder={() => saveOrder(false)}
            onSaveAndGo={() => saveOrder(true)}
            onCancel={() => setStep('select_styles')}
            saving={saving}
          />
        ) : null}
      </div>
    </div>
  )
}
