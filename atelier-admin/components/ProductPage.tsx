'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useHierarchy } from '@/lib/hierarchy-context'
import { GENDER_LABELS, COLLECTION_TYPE_LABELS } from '@/lib/product-hierarchy'
import {
  STYLE_ATTRIBUTES,
  GENDER_LABELS as VIEW_GENDER_LABELS,
  COLLECTION_LABELS,
  STATUS_LABELS,
  type ViewFilter,
} from '@/lib/view-attributes'

interface Style {
  id: string
  name: string
  material: string | null
  images: string[] | null
  status: string
  gender: string
  collection_type: string
  display_order: number
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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-900', text: 'text-green-100', label: 'Active' },
  development: { bg: 'bg-yellow-900', text: 'text-yellow-100', label: 'Development' },
  archived: { bg: 'bg-neutral-800', text: 'text-neutral-400', label: 'Archived' },
}

// SVG Icons
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function GalleryIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5">
      <rect x="1" y="1" width="14" height="6" rx="1" />
      <rect x="1" y="9" width="14" height="6" rx="1" />
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

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function ProductPage({ initialStyles }: { initialStyles: Style[] }) {
  const { conceptId, categoryId, genderId, conceptName, genderName, categoryName, clearSelection, clearGender, clearCategory } = useHierarchy()

  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ViewFilter[]>([])
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [viewsDropdownOpen, setViewsDropdownOpen] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingViewId, setEditingViewId] = useState<string | null>(null)

  // Fetch saved views
  const fetchViews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('views')
      .select('id, name, type, filters, sort, display_options')
      .eq('entity', 'styles')
      .order('name')
    if (data) setSavedViews(data as SavedView[])
  }, [])

  useEffect(() => {
    fetchViews()
  }, [fetchViews])

  // Filter styles based on hierarchy context
  const hierarchyFiltered = initialStyles.filter((s) => {
    if (conceptId && getConceptName(s) !== conceptName) return false
    if (genderId && s.gender !== genderId) return false
    if (categoryId && getCategoryName(s) !== categoryName) return false
    return true
  })

  // Apply ad-hoc filters
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
      selected_attributes: ['name', 'images', 'gender', 'collection_type', 'category_name', 'status'],
      filters,
      sort: [{ field: 'display_order', direction: 'asc' }],
      group_by: [],
      display_options: {
        items_per_row: 3,
        image_size: 'medium' as const,
        card_attributes: ['gender', 'collection_type', 'category_name'],
        show_pagination: true,
        items_per_page: 24,
      },
      export_options: {
        header_text: '',
        page_size: 'a4' as const,
        include_images: true,
        include_header: true,
      },
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
    if (activeViewId === id) {
      setActiveViewId(null)
      setFilters([])
    }
    await fetchViews()
  }

  const addFilter = () => {
    const filterableAttrs = STYLE_ATTRIBUTES.filter((a) => a.filterable)
    setFilters((prev) => [...prev, { field: filterableAttrs[0].key, operator: 'eq', value: '' }])
  }

  const removeFilter = (idx: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateFilter = (idx: number, updates: Partial<ViewFilter>) => {
    setFilters((prev) => prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)))
  }

  const smallInputClass = 'px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-white text-xs focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            {conceptName && (
              <span className="text-neutral-600">
                {' '}in {conceptName}
                {genderName && ` / ${genderName}`}
                {categoryName && ` / ${categoryName}`}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/styles/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          New Product
        </Link>
      </div>

      {/* Breadcrumb filter */}
      {conceptName && (
        <div className="flex items-center gap-2 text-sm mb-4">
          <span className="text-neutral-500">Viewing:</span>
          <button onClick={clearSelection} className="text-neutral-400 hover:text-white transition">
            All
          </button>
          <span className="text-neutral-600">/</span>
          {genderName ? (
            <>
              <button onClick={clearGender} className="text-neutral-400 hover:text-white transition">
                {conceptName}
              </button>
              <span className="text-neutral-600">/</span>
              {categoryName ? (
                <>
                  <button onClick={clearCategory} className="text-neutral-400 hover:text-white transition">
                    {genderName}
                  </button>
                  <span className="text-neutral-600">/</span>
                  <span className="text-white font-medium">{categoryName}</span>
                </>
              ) : (
                <span className="text-white font-medium">{genderName}</span>
              )}
            </>
          ) : (
            <span className="text-white font-medium">{conceptName}</span>
          )}
          <button
            onClick={clearSelection}
            className="ml-2 text-xs text-neutral-600 hover:text-neutral-400 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 py-2 border-y border-neutral-800">
        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
            showFilters || filters.length > 0
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FilterIcon />
          Filter
          {filters.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-neutral-700 rounded text-[10px]">
              {filters.length}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-neutral-800" />

        {/* Views dropdown */}
        <div className="relative">
          <button
            onClick={() => setViewsDropdownOpen(!viewsDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              activeViewId
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {activeView ? activeView.name : 'Views'}
            <ChevronDownIcon />
          </button>

          {viewsDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setViewsDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                {/* Default option */}
                <button
                  onClick={clearView}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-neutral-800 ${
                    !activeViewId ? 'text-white bg-neutral-800' : 'text-neutral-300'
                  }`}
                >
                  Default view
                </button>

                {savedViews.length > 0 && (
                  <div className="border-t border-neutral-800">
                    <div className="px-4 py-1.5 text-[10px] text-neutral-600 uppercase tracking-wider">
                      Saved views
                    </div>
                    {savedViews.map((view) => (
                      <div
                        key={view.id}
                        className={`flex items-center justify-between px-4 py-2 hover:bg-neutral-800 transition group ${
                          activeViewId === view.id ? 'text-white bg-neutral-800' : 'text-neutral-300'
                        }`}
                      >
                        <button
                          onClick={() => applyView(view)}
                          className="flex-1 text-left text-sm"
                        >
                          {view.name}
                          <span className="ml-2 text-[10px] text-neutral-600">{view.type}</span>
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingViewId(view.id)
                              setSaveName(view.name)
                              setViewMode(view.type)
                              setFilters(view.filters || [])
                              setShowSaveModal(true)
                              setViewsDropdownOpen(false)
                            }}
                            className="p-1 text-neutral-500 hover:text-white transition"
                            title="Edit view"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteView(view.id)
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 transition"
                            title="Delete view"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setEditingViewId(null)
                      setSaveName('')
                      setShowSaveModal(true)
                      setViewsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  >
                    + Save current view
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Grid / Gallery toggle */}
        <div className="flex items-center bg-neutral-900 rounded p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition ${
              viewMode === 'grid'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <GridIcon active={viewMode === 'grid'} />
            Grid
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition ${
              viewMode === 'gallery'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <GalleryIcon active={viewMode === 'gallery'} />
            Gallery
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Filters</span>
            <div className="flex gap-2">
              {filters.length > 0 && (
                <button
                  onClick={() => setFilters([])}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={addFilter}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                + Add filter
              </button>
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
                    <select
                      value={f.field}
                      onChange={(e) => updateFilter(idx, { field: e.target.value, value: '' })}
                      className={smallInputClass}
                    >
                      {STYLE_ATTRIBUTES.filter((a) => a.filterable).map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                    <select
                      value={f.operator}
                      onChange={(e) => updateFilter(idx, { operator: e.target.value as ViewFilter['operator'] })}
                      className={smallInputClass}
                    >
                      <option value="eq">equals</option>
                      <option value="neq">not equals</option>
                      <option value="contains">contains</option>
                    </select>
                    {attr?.enumValues ? (
                      <select
                        value={f.value}
                        onChange={(e) => updateFilter(idx, { value: e.target.value })}
                        className={`${smallInputClass} flex-1`}
                      >
                        <option value="">All</option>
                        {attr.enumValues.map((ev) => (
                          <option key={ev.value} value={ev.value}>{ev.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={f.value}
                        onChange={(e) => updateFilter(idx, { value: e.target.value })}
                        placeholder="Value..."
                        className={`${smallInputClass} flex-1`}
                      />
                    )}
                    <button
                      onClick={() => removeFilter(idx)}
                      className="p-1 text-neutral-600 hover:text-red-400 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M20.38 3.46L16 2 12 3.46 8 2 3.62 3.46a2 2 0 00-1.34 1.89v13.3a2 2 0 001.34 1.89L8 22l4-1.46L16 22l4.38-1.46a2 2 0 001.34-1.89V5.35a2 2 0 00-1.34-1.89z" />
            <line x1="12" y1="22" x2="12" y2="3.46" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No products found</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
            {filters.length > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first product to start building your collection.'}
          </p>
          {filters.length > 0 ? (
            <button
              onClick={() => setFilters([])}
              className="inline-block px-6 py-3 border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/admin/styles/new"
              className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
            >
              Create First Product
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View - Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((style) => {
            const s = statusConfig[style.status] || statusConfig.development
            return (
              <Link
                key={style.id}
                href={`/admin/styles/${style.id}`}
                className="border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition group"
              >
                {style.images?.[0] ? (
                  <img
                    src={style.images[0]}
                    alt={style.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-neutral-900 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition">
                    {style.name}
                  </h3>
                  <p className="text-neutral-500 text-sm">{style.material}</p>
                  {style.categories && (
                    <p className="text-neutral-600 text-xs mt-1">
                      {style.categories.concepts.name} / {GENDER_LABELS[style.gender] || style.gender} / {style.categories.name}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs rounded ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-neutral-800 text-neutral-400">
                      {GENDER_LABELS[style.gender] || style.gender}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-neutral-800 text-neutral-400">
                      {COLLECTION_TYPE_LABELS[style.collection_type] || style.collection_type}
                    </span>
                    {style.variants?.length > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-neutral-800 text-neutral-400">
                        {style.variants.length} variant{style.variants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* Gallery View - large images, minimal info */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((style) => (
            <Link
              key={style.id}
              href={`/admin/styles/${style.id}`}
              className="group"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-600 transition mb-2">
                {style.images?.[0] ? (
                  <img
                    src={style.images[0]}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate group-hover:text-white transition">{style.name}</p>
              <p className="text-xs text-neutral-500 truncate">{style.material}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Save View Modal */}
      {showSaveModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => { setShowSaveModal(false); setEditingViewId(null) }} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md pointer-events-auto shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">
                {editingViewId ? 'Edit View' : 'Save View'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-1.5">
                    View name
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g. Men's RTW Active"
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:border-neutral-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wide mb-1.5">
                    View type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 py-2 text-sm rounded border transition ${
                        viewMode === 'grid'
                          ? 'border-white text-white'
                          : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('gallery')}
                      className={`flex-1 py-2 text-sm rounded border transition ${
                        viewMode === 'gallery'
                          ? 'border-white text-white'
                          : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      Gallery
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">
                  {filters.length > 0
                    ? `${filters.length} filter${filters.length !== 1 ? 's' : ''} will be saved with this view.`
                    : 'No filters to save. Add filters before saving to create a filtered view.'}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowSaveModal(false); setEditingViewId(null) }}
                  className="flex-1 py-2.5 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveView}
                  disabled={!saveName.trim() || saving}
                  className="flex-1 py-2.5 text-sm bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
                >
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
