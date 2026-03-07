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

interface Logo {
  id: string
  company_name: string
  file_url: string
  file_format: string
}

interface VariantLine {
  size: string
  color: string
  quantity: string
}

interface CustomerData {
  customerName: string
  customerEmail: string
  customerCompany: string
  customerPhone: string
}

interface QuoteFormData {
  styleId: string
  styleName: string
  customerName: string
  customerEmail: string
  customerCompany: string
  customerPhone: string
  quantity: string
  message: string
  colourMode: 'dtm' | 'colour_card' | ''
  colourValue: string
  placement: string
  technique: string
  logoId: string
  variantLines: VariantLine[]
}

interface CreatedQuote {
  id: string
  quote_number: string | null
  styleName: string
}

type ModalStep = 'customer_info' | 'select_styles' | 'fill_quote' | 'done'
type StyleViewMode = 'dropdown' | 'grid' | 'gallery'

// ─── Common Sizes for Quick-Add ──────────────────────────────────────

const COMMON_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

// ─── Quote Number Generation ─────────────────────────────────────────

function generateQuoteNumber(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `QR-${yy}${mm}-${rand}`
}

// ─── Customer Info Form (Step 1) ─────────────────────────────────────

function CustomerInfoForm({
  data,
  onChange,
  onConfirm,
  onCancel,
}: {
  data: CustomerData
  onChange: (data: CustomerData) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const inputClass = 'w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  const canContinue = data.customerName.trim() && data.customerEmail.trim()

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Customer Information</h3>
        <p className="text-sm text-neutral-500 mt-1">Enter customer details before selecting products.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Customer Name *</label>
          <input
            type="text"
            value={data.customerName}
            onChange={(e) => onChange({ ...data, customerName: e.target.value })}
            className={inputClass}
            placeholder="Full name"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Email *</label>
          <input
            type="email"
            value={data.customerEmail}
            onChange={(e) => onChange({ ...data, customerEmail: e.target.value })}
            className={inputClass}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Company</label>
          <input
            type="text"
            value={data.customerCompany}
            onChange={(e) => onChange({ ...data, customerCompany: e.target.value })}
            className={inputClass}
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Phone</label>
          <input
            type="tel"
            value={data.customerPhone}
            onChange={(e) => onChange({ ...data, customerPhone: e.target.value })}
            className={inputClass}
            placeholder="+31 ..."
          />
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
          disabled={!canContinue}
          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Product Selection
        </button>
      </div>
    </div>
  )
}

// ─── Style Selector (Step 2) ─────────────────────────────────────────

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
  const [viewMode, setViewMode] = useState<StyleViewMode>('dropdown')
  const [search, setSearch] = useState('')
  const [conceptFilter, setConceptFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Styles</h3>
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

      {/* Search + filters */}
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

      {/* Selection count */}
      <p className="text-xs text-neutral-500">
        {selectedIds.size} style{selectedIds.size !== 1 ? 's' : ''} selected
        {filtered.length !== styles.length && ` · ${filtered.length} of ${styles.length} shown`}
      </p>

      {/* Dropdown / List view */}
      {viewMode === 'dropdown' && (
        <div ref={dropdownRef} className="border border-neutral-800 rounded-lg max-h-72 overflow-y-auto">
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

      {/* Grid view — matches Product/Views grid style */}
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

      {/* Actions */}
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
          Continue with {selectedIds.size} style{selectedIds.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

// ─── Per-Style Quote Form (Step 3) ───────────────────────────────────

function QuoteForm({
  style,
  logos,
  formData,
  customerData,
  currentIndex,
  totalCount,
  onSave,
  onCancel,
}: {
  style: Style
  logos: Logo[]
  formData: QuoteFormData
  customerData: CustomerData
  currentIndex: number
  totalCount: number
  onSave: (data: QuoteFormData) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<QuoteFormData>(formData)
  const [saving, setSaving] = useState(false)
  const [quickAddSizes, setQuickAddSizes] = useState<Set<string>>(new Set())

  const update = <K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const addVariantLine = () => {
    setData((prev) => ({
      ...prev,
      variantLines: [...prev.variantLines, { size: '', color: '', quantity: '' }],
    }))
  }

  const updateVariantLine = (index: number, field: keyof VariantLine, value: string) => {
    setData((prev) => ({
      ...prev,
      variantLines: prev.variantLines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      ),
    }))
  }

  const removeVariantLine = (index: number) => {
    setData((prev) => ({
      ...prev,
      variantLines: prev.variantLines.filter((_, i) => i !== index),
    }))
  }

  // Quick-add size toggle
  const toggleQuickSize = (size: string) => {
    setQuickAddSizes((prev) => {
      const next = new Set(prev)
      if (next.has(size)) {
        next.delete(size)
        // Remove the variant line for this size
        setData((prevData) => ({
          ...prevData,
          variantLines: prevData.variantLines.filter((l) => l.size !== size),
        }))
      } else {
        next.add(size)
        // Add a variant line for this size
        setData((prevData) => ({
          ...prevData,
          variantLines: [...prevData.variantLines.filter((l) => l.size || l.color || l.quantity), { size, color: '', quantity: '' }],
        }))
      }
      return next
    })
  }

  const handleSave = () => {
    setSaving(true)
    onSave(data)
  }

  const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'
  const readOnlyClass = 'w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800/50 rounded text-neutral-500 text-sm cursor-not-allowed'

  return (
    <div className="space-y-5">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Quote for: <span className="text-blue-400">{style.name}</span>
        </h3>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded">
          {currentIndex + 1} of {totalCount}
        </span>
      </div>

      {/* Style preview */}
      <div className="flex gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
        {style.images?.[0] ? (
          <img src={style.images[0]} alt="" className="w-16 h-16 rounded object-cover bg-neutral-800" />
        ) : (
          <div className="w-16 h-16 rounded bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
            No img
          </div>
        )}
        <div className="text-sm">
          <div className="font-medium">{style.name}</div>
          <div className="text-neutral-500 text-xs">
            {[style.concepts?.name, style.categories?.name].filter(Boolean).join(' / ')}
          </div>
          {style.base_cost && <div className="text-neutral-400 text-xs mt-0.5">Base: €{Number(style.base_cost).toFixed(2)}</div>}
          {style.material && <div className="text-neutral-500 text-xs">{style.material}</div>}
        </div>
      </div>

      {/* Customer Info — read-only, greyed out */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-400 mb-3">Customer</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Name</label>
            <input type="text" value={customerData.customerName} readOnly className={readOnlyClass} tabIndex={-1} />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Email</label>
            <input type="text" value={customerData.customerEmail} readOnly className={readOnlyClass} tabIndex={-1} />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Company</label>
            <input type="text" value={customerData.customerCompany || '—'} readOnly className={readOnlyClass} tabIndex={-1} />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Phone</label>
            <input type="text" value={customerData.customerPhone || '—'} readOnly className={readOnlyClass} tabIndex={-1} />
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div className="w-32">
        <label className="block text-xs text-neutral-500 mb-1">Quantity</label>
        <input type="number" value={data.quantity} onChange={(e) => update('quantity', e.target.value)} className={inputClass} min="1" />
      </div>

      {/* Colour Mode */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-400 mb-3">Colour</h4>
        <div className="flex gap-3 mb-3">
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
            data.colourMode === 'dtm' ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'
          }`}>
            <input
              type="radio"
              name="colourMode"
              value="dtm"
              checked={data.colourMode === 'dtm'}
              onChange={() => update('colourMode', 'dtm')}
              className="accent-white"
            />
            <div>
              <div className="text-sm font-medium">DTM</div>
              <div className="text-[10px] text-neutral-500">Dye To Match (Pantone)</div>
            </div>
          </label>
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
            data.colourMode === 'colour_card' ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'
          }`}>
            <input
              type="radio"
              name="colourMode"
              value="colour_card"
              checked={data.colourMode === 'colour_card'}
              onChange={() => update('colourMode', 'colour_card')}
              className="accent-white"
            />
            <div>
              <div className="text-sm font-medium">Colour Card</div>
              <div className="text-[10px] text-neutral-500">From supplier card</div>
            </div>
          </label>
        </div>
        {data.colourMode === 'dtm' && (
          <input
            type="text"
            value={data.colourValue}
            onChange={(e) => update('colourValue', e.target.value)}
            placeholder="e.g. Pantone 186 C"
            className={inputClass}
          />
        )}
        {data.colourMode === 'colour_card' && (
          <p className="text-xs text-neutral-500">Colour will be selected from the supplier&apos;s standard colour card.</p>
        )}
      </div>

      {/* Customization — Placement & Technique */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-400 mb-3">Customization</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Placement</label>
            <select value={data.placement} onChange={(e) => update('placement', e.target.value)} className={inputClass}>
              <option value="">—</option>
              <option value="center_front">Center Front</option>
              <option value="center_back">Center Back</option>
              <option value="hsp">From HSP</option>
              <option value="wrs">Center on WRS</option>
              <option value="wls">Center on WLS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Technique</label>
            <select value={data.technique} onChange={(e) => update('technique', e.target.value)} className={inputClass}>
              <option value="">—</option>
              <option value="embroidery">Embroidery</option>
              <option value="print">Print</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logo selection */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Logo</label>
        <select value={data.logoId} onChange={(e) => update('logoId', e.target.value)} className={inputClass}>
          <option value="">— Select logo from library —</option>
          {logos.map((l) => (
            <option key={l.id} value={l.id}>{l.company_name} ({l.file_format})</option>
          ))}
        </select>
        {data.logoId && (
          <div className="mt-2">
            {(() => {
              const logo = logos.find((l) => l.id === data.logoId)
              return logo ? (
                <img src={logo.file_url} alt={logo.company_name} className="h-12 object-contain bg-neutral-900 rounded p-2" />
              ) : null
            })()}
          </div>
        )}
      </div>

      {/* Variant Breakdown with Quick-Add */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-400 mb-2">Variant Breakdown</h4>

        {/* Quick-add sizes */}
        <div className="mb-3">
          <label className="block text-xs text-neutral-500 mb-2">Quick add sizes</label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleQuickSize(size)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
                  quickAddSizes.has(size)
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Manual variant lines */}
        <div className="space-y-2">
          {data.variantLines.map((line, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={line.size} onChange={(e) => updateVariantLine(i, 'size', e.target.value)} placeholder="Size" className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" />
              <input type="text" value={line.color} onChange={(e) => updateVariantLine(i, 'color', e.target.value)} placeholder="Color" className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" />
              <input type="number" value={line.quantity} onChange={(e) => updateVariantLine(i, 'quantity', e.target.value)} placeholder="Qty" className="w-20 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" min="1" />
              {data.variantLines.length > 1 && (
                <button type="button" onClick={() => removeVariantLine(i)} className="px-2 py-2 text-neutral-500 hover:text-red-400 transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addVariantLine} className="text-xs text-neutral-400 hover:text-white transition">+ Add line</button>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Notes / Message</label>
        <textarea value={data.message} onChange={(e) => update('message', e.target.value)} rows={2} className={inputClass} placeholder="Any special requests..." />
      </div>

      {/* Actions */}
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
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : currentIndex < totalCount - 1 ? 'Save & Next' : 'Save & Finish'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────

export default function NewQuoteModal({
  onClose,
  onQuoteCreated,
}: {
  onClose: () => void
  onQuoteCreated: () => void
}) {
  const [step, setStep] = useState<ModalStep>('customer_info')
  const [styles, setStyles] = useState<Style[]>([])
  const [logos, setLogos] = useState<Logo[]>([])
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<string>>(new Set())
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [createdQuotes, setCreatedQuotes] = useState<CreatedQuote[]>([])

  // Customer data collected in step 1
  const [customerData, setCustomerData] = useState<CustomerData>({
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerPhone: '',
  })

  const supabase = createClient()
  const router = useRouter()

  useEscapeClose(onClose)

  // Load styles and logos
  useEffect(() => {
    Promise.all([
      supabase
        .from('styles')
        .select('id, name, images, base_cost, material, gender, status, category_id, concept_id, categories(name), concepts(name)')
        .neq('status', 'archived')
        .order('name'),
      supabase
        .from('logos')
        .select('id, company_name, file_url, file_format')
        .order('company_name'),
    ]).then(([stylesRes, logosRes]) => {
      if (stylesRes.data) {
        const normalized = (stylesRes.data as Record<string, unknown>[]).map((s) => ({
          ...s,
          categories: Array.isArray(s.categories) ? s.categories[0] || null : s.categories,
          concepts: Array.isArray(s.concepts) ? s.concepts[0] || null : s.concepts,
        }))
        setStyles(normalized as Style[])
      }
      if (logosRes.data) setLogos(logosRes.data)
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedStylesList = useMemo(() => {
    return Array.from(selectedStyleIds).map((id) => styles.find((s) => s.id === id)).filter(Boolean) as Style[]
  }, [selectedStyleIds, styles])

  const toggleStyle = (id: string) => {
    setSelectedStyleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCustomerConfirm = () => {
    if (!customerData.customerName.trim() || !customerData.customerEmail.trim()) {
      toast.error('Customer name and email are required')
      return
    }
    setStep('select_styles')
  }

  const handleConfirmSelection = () => {
    if (selectedStyleIds.size === 0) return
    setCurrentQuoteIndex(0)
    setStep('fill_quote')
  }

  const makeDefaultFormData = (style: Style): QuoteFormData => ({
    styleId: style.id,
    styleName: style.name,
    ...customerData,
    quantity: '1',
    message: '',
    colourMode: '',
    colourValue: '',
    placement: '',
    technique: '',
    logoId: '',
    variantLines: [{ size: '', color: '', quantity: '' }],
  })

  const handleSaveQuote = async (data: QuoteFormData) => {
    const quoteNumber = generateQuoteNumber()

    const customizationPreferences: Record<string, string> = {}
    if (data.placement) customizationPreferences.placement = data.placement
    if (data.technique) customizationPreferences.technique = data.technique
    if (data.colourMode) customizationPreferences.colour_mode = data.colourMode
    if (data.colourValue) customizationPreferences.colour_value = data.colourValue
    if (data.logoId) customizationPreferences.logo_id = data.logoId

    const variantPrefs = data.variantLines
      .filter((l) => l.size || l.color)
      .map((l) => ({
        size: l.size || null,
        color: l.color || null,
        quantity: l.quantity ? parseInt(l.quantity) : null,
      }))

    const basePayload = {
      customer_name: customerData.customerName,
      customer_email: customerData.customerEmail,
      customer_company: customerData.customerCompany || null,
      customer_phone: customerData.customerPhone || null,
      style_id: data.styleId,
      product_name: data.styleName,
      quantity: parseInt(data.quantity) || 1,
      message: data.message || null,
      customization_preferences: Object.keys(customizationPreferences).length > 0 ? customizationPreferences : {},
      variant_preferences: variantPrefs.length > 0 ? variantPrefs : [],
    }

    // Try with quote_number column first; fall back without it if column doesn't exist yet
    let inserted: { id: string; quote_number?: string | null } | null = null
    let finalQuoteNumber: string | null = quoteNumber

    const { data: result, error } = await supabase.from('quote_requests').insert({
      ...basePayload,
      quote_number: quoteNumber,
    }).select('id, quote_number').single()

    if (error) {
      if (error.message.includes('quote_number')) {
        // Column doesn't exist yet — insert without it
        finalQuoteNumber = null
        const { data: fallback, error: fallbackErr } = await supabase.from('quote_requests')
          .insert(basePayload)
          .select('id').single()
        if (fallbackErr) {
          toast.error(fallbackErr.message)
          return
        }
        inserted = fallback
      } else {
        toast.error(error.message)
        return
      }
    } else {
      inserted = result
    }

    if (!inserted) return

    setCreatedQuotes((prev) => [...prev, {
      id: inserted!.id,
      quote_number: finalQuoteNumber,
      styleName: data.styleName,
    }])

    toast.success(`Quote ${finalQuoteNumber || ''} saved for ${data.styleName}`.trim())

    // Move to next style or finish
    const nextIndex = currentQuoteIndex + 1
    if (nextIndex < selectedStylesList.length) {
      setCurrentQuoteIndex(nextIndex)
    } else {
      onQuoteCreated()
      setStep('done')
    }
  }

  const handleViewQuote = (quoteId: string) => {
    onClose()
    router.push(`/admin/quotes/${quoteId}`)
  }

  const handleDone = () => {
    onClose()
    // Navigate to the last created quote
    if (createdQuotes.length > 0) {
      router.push(`/admin/quotes/${createdQuotes[createdQuotes.length - 1].id}`)
    }
  }

  const currentStyle = selectedStylesList[currentQuoteIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-neutral-500 text-sm">Loading...</div>
          </div>
        ) : step === 'customer_info' ? (
          <CustomerInfoForm
            data={customerData}
            onChange={setCustomerData}
            onConfirm={handleCustomerConfirm}
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
        ) : step === 'fill_quote' && currentStyle ? (
          <QuoteForm
            key={currentStyle.id}
            style={currentStyle}
            logos={logos}
            formData={makeDefaultFormData(currentStyle)}
            customerData={customerData}
            currentIndex={currentQuoteIndex}
            totalCount={selectedStylesList.length}
            onSave={handleSaveQuote}
            onCancel={onClose}
          />
        ) : step === 'done' ? (
          <div className="text-center py-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-emerald-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Quote Offer Created</h3>
            <p className="text-sm text-neutral-400 mb-6">
              {createdQuotes.length} quote{createdQuotes.length !== 1 ? 's' : ''} saved successfully.
            </p>

            {/* Created quotes summary */}
            <div className="mb-6 space-y-2 text-left max-w-sm mx-auto">
              {createdQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <div>
                    <span className="text-xs font-mono text-neutral-500">{q.quote_number}</span>
                    <div className="text-sm font-medium text-white">{q.styleName}</div>
                  </div>
                  <button
                    onClick={() => handleViewQuote(q.id)}
                    className="px-3 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-700 rounded hover:border-neutral-500 transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleDone}
              className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              {createdQuotes.length === 1 ? 'View Quote' : 'View Latest Quote'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
