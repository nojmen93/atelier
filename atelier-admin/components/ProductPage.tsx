'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useHierarchy } from '@/lib/hierarchy-context'
import { GENDER_LABELS, COLLECTION_TYPE_LABELS } from '@/lib/product-hierarchy'
import {
  STYLE_ATTRIBUTES,
  STATUS_LABELS,
  GENDER_LABELS as VIEW_GENDER_LABELS,
  COLLECTION_LABELS,
  CAPABILITY_LABELS,
  type ViewFilter,
} from '@/lib/view-attributes'

interface Style {
  id: string
  name: string
  material: string | null
  description: string | null
  images: string[] | null
  status: string
  gender: string
  collection_type: string
  product_capability: string
  base_cost: number | null
  lead_time_days: number | null
  display_order: number
  created_at: string
  updated_at: string
  categories: { name: string; concepts: { name: string } } | null
  variants: { id: string }[]
}

interface SavedView {
  id: string
  name: string
  type: 'grid' | 'gallery'
  filters: ViewFilter[]
  sort: { field: string; direction: 'asc' | 'desc' }[]
  display_options: {
    items_per_row: number
    image_size: 'small' | 'medium' | 'large'
    card_attributes: string[]
    show_pagination: boolean
    items_per_page: number
  }
}

function getConceptName(style: Style): string | null {
  return style.categories?.concepts?.name || null
}

function getCategoryName(style: Style): string | null {
  return style.categories?.name || null
}

function formatValue(key: string, style: Style): string {
  switch (key) {
    case 'name': return style.name
    case 'description': return style.description || ''
    case 'material': return style.material || ''
    case 'gender': return VIEW_GENDER_LABELS[style.gender] || style.gender
    case 'collection_type': return COLLECTION_LABELS[style.collection_type] || style.collection_type
    case 'product_capability': return CAPABILITY_LABELS[style.product_capability] || style.product_capability
    case 'status': return STATUS_LABELS[style.status] || style.status
    case 'base_cost': return style.base_cost != null ? `€${Number(style.base_cost).toFixed(2)}` : ''
    case 'lead_time_days': return style.lead_time_days != null ? `${style.lead_time_days}d` : ''
    case 'display_order': return style.display_order.toString()
    case 'concept_name': return getConceptName(style) || ''
    case 'category_name': return getCategoryName(style) || ''
    case 'variant_count': return style.variants?.length?.toString() || '0'
    case 'created_at': return new Date(style.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    case 'updated_at': return new Date(style.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    default: return ''
  }
}

/** Raw value for CSV export — clean data, one value per cell, no symbols */
function rawValue(key: string, style: Style): string {
  switch (key) {
    case 'name': return style.name
    case 'description': return style.description || ''
    case 'material': return style.material || ''
    case 'gender': return VIEW_GENDER_LABELS[style.gender] || style.gender
    case 'collection_type': return COLLECTION_LABELS[style.collection_type] || style.collection_type
    case 'product_capability': return CAPABILITY_LABELS[style.product_capability] || style.product_capability
    case 'status': return STATUS_LABELS[style.status] || style.status
    case 'base_cost': return style.base_cost != null ? Number(style.base_cost).toFixed(2) : ''
    case 'lead_time_days': return style.lead_time_days != null ? String(style.lead_time_days) : ''
    case 'display_order': return style.display_order.toString()
    case 'concept_name': return getConceptName(style) || ''
    case 'category_name': return getCategoryName(style) || ''
    case 'variant_count': return style.variants?.length?.toString() || '0'
    case 'created_at': return style.created_at ? new Date(style.created_at).toISOString().split('T')[0] : ''
    case 'updated_at': return style.updated_at ? new Date(style.updated_at).toISOString().split('T')[0] : ''
    default: return ''
  }
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-900', text: 'text-green-100', label: 'Active' },
  development: { bg: 'bg-yellow-900', text: 'text-yellow-100', label: 'Development' },
  archived: { bg: 'bg-neutral-800', text: 'text-neutral-400', label: 'Archived' },
}

const DEFAULT_GRID_COLUMNS = ['name', 'material', 'concept_name', 'gender', 'category_name', 'collection_type', 'status', 'variant_count', 'base_cost']

// All possible grid columns (images don't belong in a table)
const ALL_GRID_COLUMNS = STYLE_ATTRIBUTES.filter((a) => a.key !== 'images').map((a) => a.key)

// ── Icons ───────────────────────────────────────────────────────────────────────

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5">
      <rect x="1" y="1" width="14" height="3" rx="0.5" />
      <rect x="1" y="6" width="14" height="3" rx="0.5" />
      <rect x="1" y="11" width="14" height="3" rx="0.5" />
      <line x1="6" y1="1" x2="6" y2="14" />
      <line x1="11" y1="1" x2="11" y2="14" />
    </svg>
  )
}

function GalleryIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function ColumnsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function ExcelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}

function DragHandleSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-neutral-600 shrink-0">
      <circle cx="4" cy="2" r="1" />
      <circle cx="8" cy="2" r="1" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="8" cy="6" r="1" />
      <circle cx="4" cy="10" r="1" />
      <circle cx="8" cy="10" r="1" />
    </svg>
  )
}

// ── Export Helpers ───────────────────────────────────────────────────────────────

function escapeCsvCell(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function exportToCsv(styles: Style[], columns: string[], filters: ViewFilter[]) {
  const headers = columns.map((key) => {
    const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
    return escapeCsvCell(attr?.label || key)
  })

  const rows = styles.map((style) =>
    columns.map((key) => escapeCsvCell(rawValue(key, style)))
  )

  // Add metadata header with active filters so the Excel user knows what's filtered
  const metaLines: string[] = []
  if (filters.length > 0) {
    const filterDescs = filters
      .filter((f) => f.value)
      .map((f) => {
        const attr = STYLE_ATTRIBUTES.find((a) => a.key === f.field)
        return `${attr?.label || f.field} ${f.operator} ${f.value}`
      })
    if (filterDescs.length > 0) {
      metaLines.push(`Filters: ${filterDescs.join('; ')}`)
      metaLines.push('')
    }
  }

  const csvContent = [...metaLines, headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportToPdfPrint() {
  window.print()
}

// ── Columns Panel ───────────────────────────────────────────────────────────────

function ColumnsPanel({
  columns,
  onColumnsChange,
  onClose,
}: {
  columns: string[]
  onColumnsChange: (cols: string[]) => void
  onClose: () => void
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const toggle = (key: string) => {
    if (columns.includes(key)) {
      if (columns.length <= 1) return
      onColumnsChange(columns.filter((c) => c !== key))
    } else {
      onColumnsChange([...columns, key])
    }
  }

  const enabledAttrs = columns.map((key) => STYLE_ATTRIBUTES.find((a) => a.key === key)!).filter(Boolean)
  const disabledAttrs = ALL_GRID_COLUMNS
    .filter((key) => !columns.includes(key))
    .map((key) => STYLE_ATTRIBUTES.find((a) => a.key === key)!)
    .filter(Boolean)

  const handleDragStart = (idx: number) => setDragIdx(idx)

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setOverIdx(idx)
  }

  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
    const newCols = [...columns]
    const [moved] = newCols.splice(dragIdx, 1)
    newCols.splice(idx, 0, moved)
    onColumnsChange(newCols)
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div ref={panelRef} className="absolute top-full right-0 mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs text-neutral-500 uppercase tracking-wide">Columns</span>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {enabledAttrs.map((attr, idx) => (
          <div
            key={attr.key}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
            className={`flex items-center gap-2 px-4 py-1.5 transition cursor-default select-none ${
              overIdx === idx ? 'border-t border-white' : 'border-t border-transparent'
            } ${dragIdx === idx ? 'opacity-40' : ''} hover:bg-neutral-800`}
          >
            <div className="cursor-grab active:cursor-grabbing"><DragHandleSmall /></div>
            <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
              <input type="checkbox" checked onChange={() => toggle(attr.key)} className="rounded border-neutral-600 bg-neutral-800 w-3.5 h-3.5 accent-white" />
              <span className="text-neutral-200">{attr.label}</span>
            </label>
          </div>
        ))}
        {disabledAttrs.length > 0 && <div className="border-t border-neutral-800 mx-4 my-1" />}
        {disabledAttrs.map((attr) => (
          <div key={attr.key} className="flex items-center gap-2 px-4 py-1.5 hover:bg-neutral-800 transition">
            <div className="w-3 shrink-0" />
            <label className="flex items-center gap-2 flex-1 cursor-pointer text-sm">
              <input type="checkbox" checked={false} onChange={() => toggle(attr.key)} className="rounded border-neutral-600 bg-neutral-800 w-3.5 h-3.5 accent-white" />
              <span className="text-neutral-500">{attr.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function ProductPage({ initialStyles }: { initialStyles: Style[] }) {
  const { conceptId, categoryId, genderId, conceptName, genderName, categoryName, clearSelection, clearGender, clearCategory } = useHierarchy()

  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [filters, setFilters] = useState<ViewFilter[]>([])
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [viewsDropdownOpen, setViewsDropdownOpen] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingViewId, setEditingViewId] = useState<string | null>(null)
  const [gridColumns, setGridColumns] = useState<string[]>(DEFAULT_GRID_COLUMNS)

  const fetchViews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('views')
      .select('id, name, type, filters, sort, display_options')
      .eq('entity', 'styles')
      .order('name')
    if (data) setSavedViews(data as SavedView[])
  }, [])

  useEffect(() => { fetchViews() }, [fetchViews])

  // Hierarchy filtering
  const hierarchyFiltered = initialStyles.filter((s) => {
    if (conceptId && getConceptName(s) !== conceptName) return false
    if (genderId && s.gender !== genderId) return false
    if (categoryId && getCategoryName(s) !== categoryName) return false
    return true
  })

  // Ad-hoc filters
  const filtered = hierarchyFiltered.filter((s) => {
    for (const f of filters) {
      if (!f.value) continue
      let val = ''
      if (f.field === 'name') val = s.name
      else if (f.field === 'material') val = s.material || ''
      else if (f.field === 'gender') val = s.gender
      else if (f.field === 'collection_type') val = s.collection_type
      else if (f.field === 'status') val = s.status
      else if (f.field === 'concept_name') val = getConceptName(s) || ''
      else if (f.field === 'category_name') val = getCategoryName(s) || ''
      const lv = val.toLowerCase()
      const fv = f.value.toLowerCase()
      if (f.operator === 'eq' && lv !== fv) return false
      if (f.operator === 'neq' && lv === fv) return false
      if (f.operator === 'contains' && !lv.includes(fv)) return false
    }
    return true
  })

  const activeView = activeViewId ? savedViews.find((v) => v.id === activeViewId) : null

  const applyView = (view: SavedView) => {
    setViewMode(view.type)
    setFilters(view.filters || [])
    setActiveViewId(view.id)
    setViewsDropdownOpen(false)
    if (view.filters?.length > 0) setShowFilters(true)
  }

  const clearView = () => {
    setActiveViewId(null)
    setFilters([])
    setShowFilters(false)
    setGridColumns(DEFAULT_GRID_COLUMNS)
    setViewsDropdownOpen(false)
  }

  const handleSaveView = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const viewData = {
      name: saveName.trim(),
      type: viewMode,
      entity: 'styles',
      selected_attributes: viewMode === 'grid' ? gridColumns : ['name', 'images', 'gender', 'collection_type', 'category_name', 'status'],
      filters,
      sort: [{ field: 'display_order', direction: 'asc' }],
      group_by: [],
      display_options: { items_per_row: 3, image_size: 'medium' as const, card_attributes: ['gender', 'collection_type', 'category_name'], show_pagination: true, items_per_page: 24 },
      export_options: { header_text: '', page_size: 'a4' as const, include_images: true, include_header: true },
      is_default: false,
    }
    if (editingViewId) {
      await supabase.from('views').update(viewData).eq('id', editingViewId)
      setActiveViewId(editingViewId)
    } else {
      const { data } = await supabase.from('views').insert(viewData).select('id').single()
      if (data) setActiveViewId(data.id)
    }
    await fetchViews()
    setSaving(false)
    setShowSaveModal(false)
    setSaveName('')
    setEditingViewId(null)
  }

  const handleDeleteView = async (id: string) => {
    const supabase = createClient()
    await supabase.from('views').delete().eq('id', id)
    if (activeViewId === id) { setActiveViewId(null); setFilters([]) }
    await fetchViews()
  }

  const addFilter = () => {
    const filterableAttrs = STYLE_ATTRIBUTES.filter((a) => a.filterable)
    setFilters((prev) => [...prev, { field: filterableAttrs[0].key, operator: 'eq', value: '' }])
  }

  const removeFilter = (idx: number) => setFilters((prev) => prev.filter((_, i) => i !== idx))

  const updateFilter = (idx: number, updates: Partial<ViewFilter>) => {
    setFilters((prev) => prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)))
  }

  const smallInputClass = 'px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-xs focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-6 print:mb-2">
        <div>
          <h1 className="text-3xl font-bold print:text-xl print:text-black">Product</h1>
          <p className="text-neutral-500 text-sm mt-1 print:text-xs print:text-gray-600">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            {conceptName && (
              <span className="text-neutral-600 print:text-gray-500">
                {' '}in {conceptName}{genderName && ` / ${genderName}`}{categoryName && ` / ${categoryName}`}
              </span>
            )}
          </p>
        </div>
        <Link href="/admin/styles/new" className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition print:hidden">
          New Product
        </Link>
      </div>

      {/* Breadcrumb */}
      {conceptName && (
        <div className="flex items-center gap-2 text-sm mb-4 print:hidden">
          <span className="text-neutral-500">Viewing:</span>
          <button onClick={clearSelection} className="text-neutral-400 hover:text-white transition">All</button>
          <span className="text-neutral-600">/</span>
          {genderName ? (
            <>
              <button onClick={clearGender} className="text-neutral-400 hover:text-white transition">{conceptName}</button>
              <span className="text-neutral-600">/</span>
              {categoryName ? (
                <>
                  <button onClick={clearCategory} className="text-neutral-400 hover:text-white transition">{genderName}</button>
                  <span className="text-neutral-600">/</span>
                  <span className="text-white font-medium">{categoryName}</span>
                </>
              ) : <span className="text-white font-medium">{genderName}</span>}
            </>
          ) : <span className="text-white font-medium">{conceptName}</span>}
          <button onClick={clearSelection} className="ml-2 text-xs text-neutral-600 hover:text-neutral-400 transition">Clear</button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-6 py-2 border-y border-neutral-800 print:hidden">
        {/* Filter */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
            showFilters || filters.length > 0 ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FilterIcon />
          Filter
          {filters.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-neutral-700 rounded text-[10px]">{filters.length}</span>}
        </button>

        <div className="w-px h-5 bg-neutral-800" />

        {/* Views dropdown */}
        <div className="relative">
          <button
            onClick={() => setViewsDropdownOpen(!viewsDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              activeViewId ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {activeView ? activeView.name : 'Views'}
            <ChevronDownIcon />
          </button>

          {viewsDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setViewsDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={clearView}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-neutral-800 ${!activeViewId ? 'text-white bg-neutral-800' : 'text-neutral-300'}`}
                >
                  Default view
                </button>
                {savedViews.length > 0 && (
                  <div className="border-t border-neutral-800">
                    <div className="px-4 py-1.5 text-[10px] text-neutral-600 uppercase tracking-wider">Saved views</div>
                    {savedViews.map((view) => (
                      <div
                        key={view.id}
                        className={`flex items-center justify-between px-4 py-2 hover:bg-neutral-800 transition group ${activeViewId === view.id ? 'text-white bg-neutral-800' : 'text-neutral-300'}`}
                      >
                        <button onClick={() => applyView(view)} className="flex-1 text-left text-sm">
                          {view.name}
                          <span className="ml-2 text-[10px] text-neutral-600">{view.type}</span>
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingViewId(view.id); setSaveName(view.name); setViewMode(view.type); setFilters(view.filters || [])
                              setShowSaveModal(true); setViewsDropdownOpen(false)
                            }}
                            className="p-1 text-neutral-500 hover:text-white transition" title="Edit view"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteView(view.id) }}
                            className="p-1 text-neutral-500 hover:text-red-400 transition" title="Delete view"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-neutral-800">
                  <button
                    onClick={() => { setEditingViewId(null); setSaveName(''); setShowSaveModal(true); setViewsDropdownOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  >
                    + Save current view
                  </button>
                  <Link href="/admin/views/new" onClick={() => setViewsDropdownOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition">
                    + New view
                  </Link>
                  <Link href="/admin/views" onClick={() => setViewsDropdownOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition border-t border-neutral-800">
                    Manage views
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-neutral-800" />

        {/* Export PDF */}
        <button onClick={exportToPdfPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition" title="Export PDF">
          <PdfIcon /> PDF
        </button>

        {/* Export Excel — grid only */}
        {viewMode === 'grid' && (
          <button onClick={() => exportToCsv(filtered, gridColumns, filters)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition" title="Export Excel (CSV)">
            <ExcelIcon /> Excel
          </button>
        )}

        <div className="flex-1" />

        {/* Columns toggle — grid only */}
        {viewMode === 'grid' && (
          <div className="relative">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${showColumns ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <ColumnsIcon /> Columns
            </button>
            {showColumns && <ColumnsPanel columns={gridColumns} onColumnsChange={setGridColumns} onClose={() => setShowColumns(false)} />}
          </div>
        )}

        {/* Grid / Gallery toggle */}
        <div className="flex items-center bg-neutral-900 rounded p-0.5">
          <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition ${viewMode === 'grid' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <GridIcon active={viewMode === 'grid'} /> Grid
          </button>
          <button onClick={() => setViewMode('gallery')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition ${viewMode === 'gallery' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <GalleryIcon active={viewMode === 'gallery'} /> Gallery
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="mb-6 p-4 border border-neutral-800 rounded-lg print:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Filters</span>
            <div className="flex gap-2">
              {filters.length > 0 && <button onClick={() => setFilters([])} className="text-xs text-neutral-500 hover:text-neutral-300 transition">Clear all</button>}
              <button onClick={addFilter} className="text-xs text-neutral-400 hover:text-white transition">+ Add filter</button>
            </div>
          </div>
          {filters.length === 0 ? (
            <p className="text-xs text-neutral-600">No filters applied. Click &quot;+ Add filter&quot; to narrow results.</p>
          ) : (
            <div className="space-y-2">
              {filters.map((f, idx) => {
                const attr = STYLE_ATTRIBUTES.find((a) => a.key === f.field)
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select value={f.field} onChange={(e) => updateFilter(idx, { field: e.target.value, value: '' })} className={smallInputClass}>
                      {STYLE_ATTRIBUTES.filter((a) => a.filterable).map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                    </select>
                    <select value={f.operator} onChange={(e) => updateFilter(idx, { operator: e.target.value as ViewFilter['operator'] })} className={smallInputClass}>
                      <option value="eq">equals</option><option value="neq">not equals</option><option value="contains">contains</option>
                    </select>
                    {attr?.enumValues ? (
                      <select value={f.value} onChange={(e) => updateFilter(idx, { value: e.target.value })} className={`${smallInputClass} flex-1`}>
                        <option value="">All</option>
                        {attr.enumValues.map((ev) => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={f.value} onChange={(e) => updateFilter(idx, { value: e.target.value })} placeholder="Value..." className={`${smallInputClass} flex-1`} />
                    )}
                    <button onClick={() => removeFilter(idx)} className="p-1 text-neutral-600 hover:text-red-400 transition">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center print:border-gray-300">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M20.38 3.46L16 2 12 3.46 8 2 3.62 3.46a2 2 0 00-1.34 1.89v13.3a2 2 0 001.34 1.89L8 22l4-1.46L16 22l4.38-1.46a2 2 0 001.34-1.89V5.35a2 2 0 00-1.34-1.89z" />
            <line x1="12" y1="22" x2="12" y2="3.46" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No products found</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
            {filters.length > 0 ? 'Try adjusting your filters to see more results.' : 'Create your first product to start building your collection.'}
          </p>
          {filters.length > 0
            ? <button onClick={() => setFilters([])} className="inline-block px-6 py-3 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition">Clear Filters</button>
            : <Link href="/admin/styles/new" className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition">Create First Product</Link>}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View — Excel-like table ── */
        <div className="border border-neutral-800 rounded-lg overflow-x-auto print:border-gray-300 print:rounded-none">
          <table className="w-full text-sm print:text-[10px] print:text-black">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide print:border-gray-300 print:text-gray-700 print:bg-gray-100">
                {gridColumns.map((key) => {
                  const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
                  return <th key={key} className="text-left px-4 py-3 font-medium whitespace-nowrap print:px-2 print:py-1.5 print:font-semibold">{attr?.label || key}</th>
                })}
                <th className="w-8 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((style) => {
                const s = statusConfig[style.status] || statusConfig.development
                return (
                  <tr key={style.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50 transition print:border-gray-200 print:hover:bg-transparent">
                    {gridColumns.map((key) => {
                      const val = formatValue(key, style)
                      if (key === 'name') {
                        return <td key={key} className="px-4 py-3 print:px-2 print:py-1.5"><Link href={`/admin/styles/${style.id}`} className="text-white font-medium hover:underline print:text-black print:no-underline">{val}</Link></td>
                      }
                      if (key === 'status') {
                        return <td key={key} className="px-4 py-3 print:px-2 print:py-1.5"><span className={`px-2 py-0.5 text-xs rounded ${s.bg} ${s.text} print:bg-transparent print:text-black print:px-0`}>{s.label}</span></td>
                      }
                      return <td key={key} className="px-4 py-3 text-neutral-300 whitespace-nowrap print:px-2 print:py-1.5 print:text-black">{val}</td>
                    })}
                    <td className="px-2 py-3 print:hidden">
                      <Link href={`/admin/styles/${style.id}`} className="text-neutral-600 hover:text-white transition" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Gallery View ── */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          {filtered.map((style) => (
            <Link key={style.id} href={`/admin/styles/${style.id}`} className="group print:break-inside-avoid">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-600 transition mb-2 print:border-gray-300 print:rounded-none">
                {style.images?.[0] ? (
                  <img src={style.images[0]} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 print:group-hover:scale-100" />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center print:bg-gray-100">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700 print:text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate group-hover:text-white transition print:text-black print:text-xs">{style.name}</p>
              <p className="text-xs text-neutral-500 truncate print:text-gray-500">{style.material}</p>
            </Link>
          ))}
        </div>
      )}

      {/* ── Save View Modal ── */}
      {showSaveModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => { setShowSaveModal(false); setEditingViewId(null) }} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md pointer-events-auto shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">{editingViewId ? 'Edit View' : 'Save View'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-1.5">View name</label>
                  <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Men's RTW Active"
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:border-neutral-500 focus:outline-none" autoFocus />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-1.5">View type</label>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('grid')} className={`flex-1 py-2 text-sm rounded border transition ${viewMode === 'grid' ? 'border-white text-white' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>Grid</button>
                    <button onClick={() => setViewMode('gallery')} className={`flex-1 py-2 text-sm rounded border transition ${viewMode === 'gallery' ? 'border-white text-white' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>Gallery</button>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">
                  {filters.length > 0
                    ? `${filters.length} filter${filters.length !== 1 ? 's' : ''} will be saved with this view.`
                    : 'No filters to save. Add filters before saving to create a filtered view.'}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowSaveModal(false); setEditingViewId(null) }} className="flex-1 py-2.5 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition">Cancel</button>
                <button onClick={handleSaveView} disabled={!saveName.trim() || saving} className="flex-1 py-2.5 text-sm bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50">
                  {saving ? 'Saving...' : editingViewId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
