'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  STYLE_ATTRIBUTES,
  GENDER_LABELS,
  COLLECTION_LABELS,
  STATUS_LABELS,
  CAPABILITY_LABELS,
  type ViewConfig,
  type ViewFilter,
} from '@/lib/view-attributes'

interface StyleRow {
  id: string
  name: string
  description: string | null
  material: string | null
  gender: string
  collection_type: string
  product_capability: string
  status: string
  base_cost: number | null
  lead_time_days: number | null
  customization_mode: string | null
  display_order: number
  images: string[] | null
  created_at: string
  updated_at: string
  concepts: { name: string } | null
  categories: { name: string } | null
  suppliers: { name: string } | null
  variants: { id: string }[]
}

function formatValue(key: string, style: StyleRow): string {
  switch (key) {
    case 'name': return style.name
    case 'description': return style.description || ''
    case 'material': return style.material || ''
    case 'gender': return GENDER_LABELS[style.gender] || style.gender
    case 'collection_type': return COLLECTION_LABELS[style.collection_type] || style.collection_type
    case 'product_capability': return CAPABILITY_LABELS[style.product_capability] || style.product_capability
    case 'status': return STATUS_LABELS[style.status] || style.status
    case 'base_cost': return style.base_cost != null ? `€${Number(style.base_cost).toFixed(2)}` : ''
    case 'lead_time_days': return style.lead_time_days != null ? `${style.lead_time_days}d` : ''
    case 'customization_mode': return style.customization_mode || ''
    case 'display_order': return style.display_order.toString()
    case 'concept_name': return style.concepts?.name || ''
    case 'category_name': return style.categories?.name || ''
    case 'supplier_name': return style.suppliers?.name || ''
    case 'variant_count': return style.variants?.length?.toString() || '0'
    case 'created_at': return new Date(style.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    case 'updated_at': return new Date(style.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    default: return ''
  }
}

function getRawValue(key: string, style: StyleRow): string {
  switch (key) {
    case 'concept_name': return style.concepts?.name || ''
    case 'category_name': return style.categories?.name || ''
    case 'supplier_name': return style.suppliers?.name || ''
    case 'variant_count': return style.variants?.length?.toString() || '0'
    default: return String((style as unknown as Record<string, unknown>)[key] ?? '')
  }
}

export default function ViewRuntime({ config }: { config: ViewConfig }) {
  const [styles, setStyles] = useState<StyleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [adHocFilters, setAdHocFilters] = useState<ViewFilter[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchStyles = useCallback(async () => {
    setLoading(true)
    setPage(0)
    const supabase = createClient()
    let query = supabase
      .from('styles')
      .select('*, concepts(name), categories(name), suppliers(name), variants(id)')

    // Apply saved filters
    for (const f of config.filters) {
      const col = f.field === 'concept_name' ? 'concepts.name'
        : f.field === 'category_name' ? 'categories.name'
        : f.field === 'supplier_name' ? 'suppliers.name'
        : f.field

      if (f.field === 'concept_name' || f.field === 'category_name' || f.field === 'supplier_name') {
        // Relation filters need special handling - filter client-side
        continue
      }
      if (f.operator === 'eq') query = query.eq(col, f.value)
      else if (f.operator === 'neq') query = query.neq(col, f.value)
      else if (f.operator === 'contains') query = query.ilike(col, `%${f.value}%`)
      else if (f.operator === 'gt') query = query.gt(col, f.value)
      else if (f.operator === 'lt') query = query.lt(col, f.value)
    }

    // Apply ad-hoc filters
    for (const f of adHocFilters) {
      if (!f.value) continue
      if (f.field === 'concept_name' || f.field === 'category_name' || f.field === 'supplier_name') continue
      if (f.operator === 'eq') query = query.eq(f.field, f.value)
      else if (f.operator === 'neq') query = query.neq(f.field, f.value)
      else if (f.operator === 'contains') query = query.ilike(f.field, `%${f.value}%`)
      else if (f.operator === 'gt') query = query.gt(f.field, f.value)
      else if (f.operator === 'lt') query = query.lt(f.field, f.value)
    }

    // Apply sort
    for (const s of config.sort) {
      if (s.field === 'concept_name' || s.field === 'category_name' || s.field === 'supplier_name' || s.field === 'variant_count') continue
      query = query.order(s.field, { ascending: s.direction === 'asc' })
    }

    const { data } = await query
    let results = (data || []) as StyleRow[]

    // Client-side filters for relation fields
    const allFilters = [...config.filters, ...adHocFilters]
    for (const f of allFilters) {
      if (!f.value) continue
      if (f.field === 'concept_name' || f.field === 'category_name' || f.field === 'supplier_name') {
        results = results.filter((s) => {
          const val = getRawValue(f.field, s).toLowerCase()
          if (f.operator === 'eq') return val === f.value.toLowerCase()
          if (f.operator === 'neq') return val !== f.value.toLowerCase()
          if (f.operator === 'contains') return val.includes(f.value.toLowerCase())
          return true
        })
      }
    }

    setStyles(results)
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.filters, config.sort, adHocFilters])

  useEffect(() => {
    fetchStyles()
  }, [fetchStyles])

  // Pagination
  const perPage = config.display_options.items_per_page || 24
  const totalPages = Math.ceil(styles.length / perPage)
  const pagedStyles = config.display_options.show_pagination
    ? styles.slice(page * perPage, (page + 1) * perPage)
    : styles

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const visibleIds = pagedStyles.map((s) => s.id)
    const allVisible = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
    if (allVisible) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of visibleIds) next.delete(id)
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of visibleIds) next.add(id)
        return next
      })
    }
  }

  const addAdHocFilter = () => {
    const filterableAttrs = STYLE_ATTRIBUTES.filter((a) => a.filterable)
    setAdHocFilters((prev) => [...prev, { field: filterableAttrs[0].key, operator: 'eq', value: '' }])
  }

  const resetAdHocFilters = () => {
    setAdHocFilters([])
    setPage(0)
  }

  // Grouping
  const groups = config.group_by.length > 0
    ? groupStyles(pagedStyles, config.group_by)
    : [{ key: '', styles: pagedStyles }]

  const imageSizeClass = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
  }[config.display_options.image_size] || 'h-48'

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-3 lg:grid-cols-6',
  }[config.display_options.items_per_row] || 'grid-cols-3'

  const smallInputClass = 'px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/views" className="text-sm text-neutral-400 hover:text-white transition">
            ← Views
          </Link>
          <h1 className="text-3xl font-bold mt-1">{config.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {styles.length} style{styles.length !== 1 ? 's' : ''}
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addAdHocFilter}
            className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
          >
            Filter
          </button>
          {adHocFilters.length > 0 && (
            <button
              onClick={resetAdHocFilters}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
            >
              Reset
            </button>
          )}
          {config.id && (
            <Link
              href={`/admin/views/${config.id}`}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
            >
              Edit View
            </Link>
          )}
          {config.id && (
            <a
              href={`/admin/views/${config.id}/export${selectedIds.size > 0 ? `?ids=${Array.from(selectedIds).join(',')}` : ''}`}
              target="_blank"
              className="px-4 py-2 text-sm bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
            >
              Export PDF
            </a>
          )}
        </div>
      </div>

      {/* Ad-hoc filters */}
      {adHocFilters.length > 0 && (
        <div className="mb-6 p-4 border border-neutral-800 rounded-lg space-y-3">
          <span className="text-xs text-neutral-500 uppercase tracking-wide">Ad-hoc Filters</span>
          {adHocFilters.map((f, idx) => {
            const attr = STYLE_ATTRIBUTES.find((a) => a.key === f.field)
            return (
              <div key={idx} className="flex items-center gap-3">
                <select
                  value={f.field}
                  onChange={(e) => {
                    const next = [...adHocFilters]
                    next[idx] = { ...next[idx], field: e.target.value, value: '' }
                    setAdHocFilters(next)
                  }}
                  className={smallInputClass}
                >
                  {STYLE_ATTRIBUTES.filter((a) => a.filterable).map((a) => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
                <select
                  value={f.operator}
                  onChange={(e) => {
                    const next = [...adHocFilters]
                    next[idx] = { ...next[idx], operator: e.target.value as ViewFilter['operator'] }
                    setAdHocFilters(next)
                  }}
                  className={smallInputClass}
                >
                  <option value="eq">equals</option>
                  <option value="neq">not equals</option>
                  <option value="contains">contains</option>
                </select>
                {attr?.enumValues ? (
                  <select
                    value={f.value}
                    onChange={(e) => {
                      const next = [...adHocFilters]
                      next[idx] = { ...next[idx], value: e.target.value }
                      setAdHocFilters(next)
                    }}
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
                    onChange={(e) => {
                      const next = [...adHocFilters]
                      next[idx] = { ...next[idx], value: e.target.value }
                      setAdHocFilters(next)
                    }}
                    placeholder="Value..."
                    className={`${smallInputClass} flex-1`}
                  />
                )}
                <button
                  onClick={() => setAdHocFilters((prev) => prev.filter((_, i) => i !== idx))}
                  className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading styles...</p>
      ) : styles.length === 0 ? (
        <div className="border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">No styles match the current filters.</p>
        </div>
      ) : (
        <>
          {/* Grouped content */}
          {groups.map((group) => (
            <div key={group.key} className="mb-8">
              {group.key && (
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-neutral-800">
                  {group.key}
                  <span className="ml-2 text-sm font-normal text-neutral-500">({group.styles.length})</span>
                </h2>
              )}

              {/* Gallery View */}
              {config.type === 'gallery' && (
                <div className={`grid ${gridCols} gap-6`}>
                  {group.styles.map((style) => (
                    <div
                      key={style.id}
                      className={`border rounded-lg overflow-hidden transition cursor-pointer ${
                        selectedIds.has(style.id)
                          ? 'border-white'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                      onClick={() => toggleSelect(style.id)}
                    >
                      {config.selected_attributes.includes('images') && (
                        style.images?.[0] ? (
                          <img
                            src={style.images[0]}
                            alt={style.name}
                            className={`w-full ${imageSizeClass} object-cover`}
                          />
                        ) : (
                          <div className={`w-full ${imageSizeClass} bg-neutral-900 flex items-center justify-center`}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                          </div>
                        )
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{style.name}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {config.display_options.card_attributes.map((key) => {
                            const val = formatValue(key, style)
                            if (!val) return null
                            const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
                            return (
                              <span key={key} className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded">
                                {attr?.type === 'enum' ? val : `${attr?.label}: ${val}`}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid (Table) View */}
              {config.type === 'grid' && (
                <div className="border border-neutral-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide">
                        <th className="px-3 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={pagedStyles.length > 0 && pagedStyles.every((s) => selectedIds.has(s.id))}
                            onChange={toggleSelectAll}
                            className="w-3.5 h-3.5"
                          />
                        </th>
                        {config.selected_attributes.filter((k) => k !== 'images').map((key) => {
                          const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
                          return (
                            <th key={key} className="text-left px-4 py-3 font-medium whitespace-nowrap">
                              {attr?.label || key}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {group.styles.map((style) => (
                        <tr
                          key={style.id}
                          className={`border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/30 cursor-pointer ${
                            selectedIds.has(style.id) ? 'bg-neutral-900/50' : ''
                          }`}
                          onClick={() => toggleSelect(style.id)}
                        >
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(style.id)}
                              onChange={() => toggleSelect(style.id)}
                              className="w-3.5 h-3.5"
                            />
                          </td>
                          {config.selected_attributes.filter((k) => k !== 'images').map((key) => (
                            <td key={key} className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                              {formatValue(key, style)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {config.display_options.show_pagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
              <span className="text-sm text-neutral-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function groupStyles(styles: StyleRow[], groupBy: string[]): { key: string; styles: StyleRow[] }[] {
  if (groupBy.length === 0) return [{ key: '', styles }]

  const groups = new Map<string, StyleRow[]>()
  for (const style of styles) {
    const groupKey = groupBy.map((field) => formatValue(field, style)).join(' / ')
    if (!groups.has(groupKey)) groups.set(groupKey, [])
    groups.get(groupKey)!.push(style)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, styles]) => ({ key, styles }))
}
