'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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
  categories?: { name: string } | null
  concepts?: { name: string } | null
}

interface Variant {
  id: string
  style_id: string
  size: string | null
  color: string | null
  sku: string | null
}

interface SizeQty {
  size: string
  quantity: string
}

interface OrderLineData {
  styleId: string
  styleName: string
  styleImage: string | null
  color: string
  sku: string
  sizeBreakdown: SizeQty[]
  unitPrice: string
  notes: string
}

interface OrderDetails {
  orderNumber: string
  supplierId: string
  factoryId: string
  currency: string
  orderDate: string
  expectedDelivery: string
  notes: string
}

type ModalStep = 'order_details' | 'select_styles' | 'fill_lines' | 'review' | 'done'
type StyleViewMode = 'dropdown' | 'grid' | 'gallery'

const COMMON_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

// ─── Order Number Generation ─────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PO-${yy}${mm}-${rand}`
}

// ─── Step 1: Order Details ───────────────────────────────────────────

function OrderDetailsForm({
  data,
  onChange,
  suppliers,
  factories,
  onConfirm,
  onCancel,
}: {
  data: OrderDetails
  onChange: (data: OrderDetails) => void
  suppliers: { id: string; name: string }[]
  factories: { id: string; name: string }[]
  onConfirm: () => void
  onCancel: () => void
}) {
  const inputClass = 'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Order Details</h3>
        <p className="text-sm text-neutral-500 mt-1">Enter the main order information.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Order Number *</label>
          <input
            type="text"
            value={data.orderNumber}
            onChange={(e) => onChange({ ...data, orderNumber: e.target.value })}
            className={inputClass}
            placeholder="PO-2603-0001"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Order Date</label>
          <input
            type="date"
            value={data.orderDate}
            onChange={(e) => onChange({ ...data, orderDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Supplier</label>
          <select
            value={data.supplierId}
            onChange={(e) => onChange({ ...data, supplierId: e.target.value })}
            className={inputClass}
          >
            <option value="">— Select supplier —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Factory</label>
          <select
            value={data.factoryId}
            onChange={(e) => onChange({ ...data, factoryId: e.target.value })}
            className={inputClass}
          >
            <option value="">— Select factory —</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Expected Delivery</label>
          <input
            type="date"
            value={data.expectedDelivery}
            onChange={(e) => onChange({ ...data, expectedDelivery: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Currency</label>
          <select
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            className={inputClass}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="SEK">SEK</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={2}
          className={inputClass}
          placeholder="Optional order notes..."
        />
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
          disabled={!data.orderNumber.trim()}
          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Products to Order
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Style Selector (reused pattern from quotes) ─────────────

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
        <h3 className="text-lg font-semibold">Add Products to Order</h3>
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

      {/* Dropdown / List view */}
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
                    {s.base_cost && ` · €${Number(s.base_cost).toFixed(2)}`}
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
                  {s.base_cost && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded">€{Number(s.base_cost).toFixed(2)}</span>
                  )}
                  {s.material && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-500 rounded">{s.material}</span>
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
                {s.material && <div className="text-xs text-neutral-600 mt-0.5">{s.material}</div>}
                {s.base_cost && <div className="text-xs text-neutral-400 mt-0.5">€{Number(s.base_cost).toFixed(2)}</div>}
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

// ─── Step 3: Fill Line Details (all products in a grid) ──────────────

function OrderLinesEditor({
  lines,
  styles,
  variantsByStyle,
  onUpdateLine,
  onRemoveLine,
  onConfirm,
  onCancel,
  currency,
}: {
  lines: OrderLineData[]
  styles: Style[]
  variantsByStyle: Record<string, Variant[]>
  onUpdateLine: (index: number, line: OrderLineData) => void
  onRemoveLine: (index: number) => void
  onConfirm: () => void
  onCancel: () => void
  currency: string
}) {
  const inputClass = 'w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  const getColorsForStyle = (styleId: string): string[] => {
    const variants = variantsByStyle[styleId] || []
    const colors = new Set<string>()
    variants.forEach((v) => {
      if (v.color) colors.add(v.color)
    })
    return Array.from(colors)
  }

  const getLineTotal = (line: OrderLineData): number => {
    const totalQty = line.sizeBreakdown.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0)
    const price = parseFloat(line.unitPrice) || 0
    return totalQty * price
  }

  const grandTotal = lines.reduce((sum, line) => sum + getLineTotal(line), 0)
  const totalQty = lines.reduce((sum, line) => sum + line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Lines</h3>
        <span className="text-xs text-neutral-500">
          {lines.length} product{lines.length !== 1 ? 's' : ''} · {totalQty} units · {currency} {grandTotal.toFixed(2)}
        </span>
      </div>

      <div className="space-y-4 max-h-[55vh] overflow-y-auto">
        {lines.map((line, lineIdx) => {
          const style = styles.find((s) => s.id === line.styleId)
          const availableColors = getColorsForStyle(line.styleId)

          return (
            <div key={lineIdx} className="border border-neutral-800 rounded-lg p-4 space-y-3">
              {/* Line header */}
              <div className="flex items-center gap-3">
                {line.styleImage ? (
                  <img src={line.styleImage} alt="" className="w-10 h-10 rounded object-cover bg-neutral-800 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{line.styleName}</div>
                  <div className="text-xs text-neutral-500">
                    {style?.categories?.name} {style?.material && `· ${style.material}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLine(lineIdx)}
                  className="px-2 py-1 text-neutral-500 hover:text-red-400 transition text-xs"
                >
                  Remove
                </button>
              </div>

              {/* Color + SKU + Unit Price row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Colour</label>
                  {availableColors.length > 0 ? (
                    <select
                      value={line.color}
                      onChange={(e) => onUpdateLine(lineIdx, { ...line, color: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">— Select colour —</option>
                      {availableColors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={line.color}
                      onChange={(e) => onUpdateLine(lineIdx, { ...line, color: e.target.value })}
                      placeholder="Enter colour"
                      className={inputClass}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">SKU</label>
                  <input
                    type="text"
                    value={line.sku}
                    onChange={(e) => onUpdateLine(lineIdx, { ...line, sku: e.target.value })}
                    placeholder="SKU"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Unit Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => onUpdateLine(lineIdx, { ...line, unitPrice: e.target.value })}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Size breakdown — quick-add with tick boxes */}
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
                          if (exists) {
                            onUpdateLine(lineIdx, {
                              ...line,
                              sizeBreakdown: line.sizeBreakdown.filter((s) => s.size !== size),
                            })
                          } else {
                            onUpdateLine(lineIdx, {
                              ...line,
                              sizeBreakdown: [...line.sizeBreakdown, { size, quantity: '' }],
                            })
                          }
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

                {/* Qty inputs for selected sizes */}
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
                            onUpdateLine(lineIdx, { ...line, sizeBreakdown: newBreakdown })
                          }}
                          placeholder="0"
                          min="0"
                          className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-sm text-center focus:border-neutral-600 focus:outline-none"
                        />
                      </div>
                    ))}
                    <div className="flex items-center text-xs text-neutral-500 ml-2">
                      = {line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)} pcs
                    </div>
                  </div>
                )}
              </div>

              {/* Line total */}
              {parseFloat(line.unitPrice) > 0 && (
                <div className="text-right text-xs text-neutral-400">
                  Line total: {currency} {getLineTotal(line).toFixed(2)}
                </div>
              )}
            </div>
          )
        })}
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
            onClick={onConfirm}
            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
          >
            Review Order
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
  const [step, setStep] = useState<ModalStep>('order_details')
  const [styles, setStyles] = useState<Style[]>([])
  const [variantsByStyle, setVariantsByStyle] = useState<Record<string, Variant[]>>({})
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [factories, setFactories] = useState<{ id: string; name: string }[]>([])
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<string>>(new Set())
  const [orderLines, setOrderLines] = useState<OrderLineData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    orderNumber: generateOrderNumber(),
    supplierId: '',
    factoryId: '',
    currency: 'EUR',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    notes: '',
  })

  const supabase = createClient()
  const router = useRouter()

  useEscapeClose(onClose)

  // Load reference data
  useEffect(() => {
    Promise.all([
      supabase
        .from('styles')
        .select('id, name, images, base_cost, material, gender, status, category_id, concept_id, categories(name), concepts(name)')
        .neq('status', 'archived')
        .order('name'),
      supabase.from('suppliers').select('id, name').order('name'),
      supabase.from('factories').select('id, name').order('name'),
    ]).then(([stylesRes, suppliersRes, factoriesRes]) => {
      if (stylesRes.data) {
        const normalized = (stylesRes.data as Record<string, unknown>[]).map((s) => ({
          ...s,
          categories: Array.isArray(s.categories) ? s.categories[0] || null : s.categories,
          concepts: Array.isArray(s.concepts) ? s.concepts[0] || null : s.concepts,
        }))
        setStyles(normalized as Style[])
      }
      setSuppliers(suppliersRes.data || [])
      setFactories(factoriesRes.data || [])
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

  // When moving to fill_lines, fetch variants for selected styles and initialize lines
  const handleConfirmSelection = async () => {
    if (selectedStyleIds.size === 0) return

    // Fetch variants for selected styles
    const styleIds = Array.from(selectedStyleIds)
    const { data: variants } = await supabase
      .from('variants')
      .select('id, style_id, size, color, sku')
      .in('style_id', styleIds)

    const grouped: Record<string, Variant[]> = {}
    ;(variants || []).forEach((v: Variant) => {
      if (!grouped[v.style_id]) grouped[v.style_id] = []
      grouped[v.style_id].push(v)
    })
    setVariantsByStyle(grouped)

    // Initialize order lines for each selected style
    const newLines: OrderLineData[] = styleIds.map((id) => {
      const style = styles.find((s) => s.id === id)
      return {
        styleId: id,
        styleName: style?.name || '',
        styleImage: style?.images?.[0] || null,
        color: '',
        sku: '',
        sizeBreakdown: [],
        unitPrice: style?.base_cost ? String(style.base_cost) : '',
        notes: '',
      }
    })
    setOrderLines(newLines)
    setStep('fill_lines')
  }

  const handleUpdateLine = (index: number, line: OrderLineData) => {
    setOrderLines((prev) => prev.map((l, i) => i === index ? line : l))
  }

  const handleRemoveLine = (index: number) => {
    const line = orderLines[index]
    setOrderLines((prev) => prev.filter((_, i) => i !== index))
    setSelectedStyleIds((prev) => {
      const next = new Set(prev)
      next.delete(line.styleId)
      return next
    })
  }

  const handleSaveOrder = async () => {
    setSaving(true)

    const totalQty = orderLines.reduce(
      (sum, line) => sum + line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0),
      0
    )
    const totalPrice = orderLines.reduce((sum, line) => {
      const lineQty = line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)
      return sum + lineQty * (parseFloat(line.unitPrice) || 0)
    }, 0)

    // Insert the order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: orderDetails.orderNumber.trim(),
      supplier_id: orderDetails.supplierId || null,
      factory_id: orderDetails.factoryId || null,
      quantity: totalQty,
      total_price: totalPrice > 0 ? totalPrice : null,
      currency: orderDetails.currency,
      order_date: orderDetails.orderDate || null,
      expected_delivery: orderDetails.expectedDelivery || null,
      notes: orderDetails.notes || null,
      status: 'draft',
    }).select('id').single()

    if (orderError) {
      toast.error(orderError.message)
      setSaving(false)
      return
    }

    // Insert order lines
    const lineRows = orderLines.map((line, idx) => ({
      order_id: order.id,
      style_id: line.styleId,
      style_name: line.styleName,
      color: line.color || null,
      sku: line.sku || null,
      size_breakdown: line.sizeBreakdown
        .filter((s) => s.size)
        .map((s) => ({ size: s.size, quantity: parseInt(s.quantity) || 0 })),
      quantity: line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0),
      unit_price: line.unitPrice ? parseFloat(line.unitPrice) : null,
      line_total: (() => {
        const qty = line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)
        const price = parseFloat(line.unitPrice) || 0
        return qty * price > 0 ? qty * price : null
      })(),
      sort_order: idx,
    }))

    if (lineRows.length > 0) {
      const { error: linesError } = await supabase.from('order_lines').insert(lineRows)
      if (linesError) {
        // order_lines table might not exist yet
        if (!linesError.message.includes('order_lines')) {
          toast.error(linesError.message)
        }
      }
    }

    setCreatedOrderId(order.id)
    onOrderCreated()
    toast.success(`Order ${orderDetails.orderNumber} created`)
    setSaving(false)
    setStep('done')
  }

  const handleDone = () => {
    onClose()
    if (createdOrderId) {
      router.push(`/admin/orders/${createdOrderId}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-neutral-500 text-sm">Loading...</div>
          </div>
        ) : step === 'order_details' ? (
          <OrderDetailsForm
            data={orderDetails}
            onChange={setOrderDetails}
            suppliers={suppliers}
            factories={factories}
            onConfirm={() => setStep('select_styles')}
            onCancel={onClose}
          />
        ) : step === 'select_styles' ? (
          <StyleSelector
            styles={styles}
            selectedIds={selectedStyleIds}
            onToggle={toggleStyle}
            onConfirm={handleConfirmSelection}
            onCancel={() => setStep('order_details')}
          />
        ) : step === 'fill_lines' ? (
          <OrderLinesEditor
            lines={orderLines}
            styles={styles}
            variantsByStyle={variantsByStyle}
            onUpdateLine={handleUpdateLine}
            onRemoveLine={handleRemoveLine}
            onConfirm={() => setStep('review')}
            onCancel={() => setStep('select_styles')}
            currency={orderDetails.currency}
          />
        ) : step === 'review' ? (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Review Order</h3>

            {/* Order summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Order #</span>
                <div className="text-white font-mono">{orderDetails.orderNumber}</div>
              </div>
              <div>
                <span className="text-neutral-500">Date</span>
                <div className="text-white">{orderDetails.orderDate || '—'}</div>
              </div>
              <div>
                <span className="text-neutral-500">Supplier</span>
                <div className="text-white">{suppliers.find((s) => s.id === orderDetails.supplierId)?.name || '—'}</div>
              </div>
              <div>
                <span className="text-neutral-500">Factory</span>
                <div className="text-white">{factories.find((f) => f.id === orderDetails.factoryId)?.name || '—'}</div>
              </div>
            </div>

            {/* Lines summary table */}
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                    <th className="text-left px-3 py-2 font-medium">Product</th>
                    <th className="text-left px-3 py-2 font-medium">Colour</th>
                    <th className="text-left px-3 py-2 font-medium">Sizes</th>
                    <th className="text-right px-3 py-2 font-medium">Qty</th>
                    <th className="text-right px-3 py-2 font-medium">Unit</th>
                    <th className="text-right px-3 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.map((line, idx) => {
                    const lineQty = line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)
                    const lineTotal = lineQty * (parseFloat(line.unitPrice) || 0)
                    return (
                      <tr key={idx} className="border-b border-neutral-800 last:border-b-0">
                        <td className="px-3 py-2 text-white">{line.styleName}</td>
                        <td className="px-3 py-2 text-neutral-400">{line.color || '—'}</td>
                        <td className="px-3 py-2 text-neutral-400 text-xs">
                          {line.sizeBreakdown.map((s) => `${s.size}×${s.quantity || 0}`).join(', ') || '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-neutral-300">{lineQty}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-neutral-400">
                          {line.unitPrice ? `${orderDetails.currency} ${parseFloat(line.unitPrice).toFixed(2)}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-neutral-300">
                          {lineTotal > 0 ? `${orderDetails.currency} ${lineTotal.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-700">
                    <td colSpan={3} className="px-3 py-2 text-right text-xs text-neutral-500 font-medium">Total</td>
                    <td className="px-3 py-2 text-right tabular-nums text-white font-medium">
                      {orderLines.reduce((s, l) => s + l.sizeBreakdown.reduce((ss, sz) => ss + (parseInt(sz.quantity) || 0), 0), 0)}
                    </td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2 text-right tabular-nums text-white font-medium">
                      {orderDetails.currency} {orderLines.reduce((sum, line) => {
                        const q = line.sizeBreakdown.reduce((s, sz) => s + (parseInt(sz.quantity) || 0), 0)
                        return sum + q * (parseFloat(line.unitPrice) || 0)
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setStep('fill_lines')}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Back to Edit
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Order'}
                </button>
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 bg-neutral-800 text-neutral-500 text-sm font-medium rounded cursor-not-allowed"
                  title="Coming soon"
                >
                  Push Order
                </button>
              </div>
            </div>
          </div>
        ) : step === 'done' ? (
          <div className="text-center py-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-emerald-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Order Created</h3>
            <p className="text-sm text-neutral-400 mb-2">
              <span className="font-mono text-neutral-300">{orderDetails.orderNumber}</span> has been saved as draft.
            </p>
            <p className="text-xs text-neutral-500 mb-6">
              {orderLines.length} line{orderLines.length !== 1 ? 's' : ''} ·{' '}
              {orderLines.reduce((s, l) => s + l.sizeBreakdown.reduce((ss, sz) => ss + (parseInt(sz.quantity) || 0), 0), 0)} total units
            </p>
            <button
              onClick={handleDone}
              className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              View Order
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
