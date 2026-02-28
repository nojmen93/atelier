'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  STYLE_ATTRIBUTES,
  DEFAULT_VIEW_CONFIG,
  type ViewConfig,
  type ViewFilter,
  type ViewSort,
} from '@/lib/view-attributes'

const TABS = [
  { key: 'selection', label: 'Data Selection' },
  { key: 'management', label: 'Data Management' },
  { key: 'display', label: 'Display Options' },
  { key: 'settings', label: 'View Settings' },
]

const FILTER_OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
]

export default function ViewBuilder({
  initialConfig,
  viewId,
}: {
  initialConfig?: ViewConfig
  viewId?: string
}) {
  const [config, setConfig] = useState<ViewConfig>(initialConfig || DEFAULT_VIEW_CONFIG)
  const [activeTab, setActiveTab] = useState('selection')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isEdit = !!viewId

  const updateConfig = (partial: Partial<ViewConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  const handleSave = async () => {
    if (!config.name.trim()) {
      alert('Please enter a view name in the Settings tab.')
      setActiveTab('settings')
      return
    }
    setSaving(true)

    const payload = {
      name: config.name,
      type: config.type,
      entity: config.entity,
      selected_attributes: config.selected_attributes,
      filters: config.filters,
      sort: config.sort,
      group_by: config.group_by,
      display_options: config.display_options,
      export_options: config.export_options,
      is_default: config.is_default,
    }

    if (isEdit) {
      const { error } = await supabase.from('views').update(payload).eq('id', viewId)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('views').insert(payload)
      if (error) { alert(error.message); setSaving(false); return }
    }

    router.push('/admin/views')
    router.refresh()
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!viewId) return
    setDeleting(true)
    const { error } = await supabase.from('views').delete().eq('id', viewId)
    if (error) { alert(error.message); setDeleting(false); return }
    router.push('/admin/views')
    router.refresh()
  }

  const toggleAttribute = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      selected_attributes: prev.selected_attributes.includes(key)
        ? prev.selected_attributes.filter((a) => a !== key)
        : [...prev.selected_attributes, key],
    }))
  }

  const moveAttribute = (key: string, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const attrs = [...prev.selected_attributes]
      const idx = attrs.indexOf(key)
      if (direction === 'up' && idx > 0) {
        [attrs[idx - 1], attrs[idx]] = [attrs[idx], attrs[idx - 1]]
      } else if (direction === 'down' && idx < attrs.length - 1) {
        [attrs[idx], attrs[idx + 1]] = [attrs[idx + 1], attrs[idx]]
      }
      return { ...prev, selected_attributes: attrs }
    })
  }

  // Filter management
  const addFilter = () => {
    const filterableAttrs = STYLE_ATTRIBUTES.filter((a) => a.filterable)
    if (filterableAttrs.length === 0) return
    updateConfig({
      filters: [...config.filters, { field: filterableAttrs[0].key, operator: 'eq', value: '' }],
    })
  }

  const updateFilter = (index: number, partial: Partial<ViewFilter>) => {
    const filters = [...config.filters]
    filters[index] = { ...filters[index], ...partial }
    updateConfig({ filters })
  }

  const removeFilter = (index: number) => {
    updateConfig({ filters: config.filters.filter((_, i) => i !== index) })
  }

  // Sort management
  const addSort = () => {
    const sortableAttrs = STYLE_ATTRIBUTES.filter((a) => a.sortable)
    if (sortableAttrs.length === 0) return
    updateConfig({
      sort: [...config.sort, { field: sortableAttrs[0].key, direction: 'asc' }],
    })
  }

  const updateSort = (index: number, partial: Partial<ViewSort>) => {
    const sort = [...config.sort]
    sort[index] = { ...sort[index], ...partial }
    updateConfig({ sort })
  }

  const removeSort = (index: number) => {
    updateConfig({ sort: config.sort.filter((_, i) => i !== index) })
  }

  // Group by management
  const toggleGroupBy = (key: string) => {
    updateConfig({
      group_by: config.group_by.includes(key)
        ? config.group_by.filter((g) => g !== key)
        : [...config.group_by, key],
    })
  }

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'
  const smallInputClass = 'px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit View' : 'New View'}</h1>
        <div className="flex gap-3">
          {isEdit && (
            <a
              href={`/admin/views/${viewId}/render`}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
            >
              Preview
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create View'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab.key
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab A — Data Selection */}
      {activeTab === 'selection' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Select Attributes</h2>
            <p className="text-sm text-neutral-500 mb-6">Choose which fields to display in this view. Checked items appear in the order shown.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {/* Available (unchecked) */}
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Available</h3>
              <div className="space-y-1">
                {STYLE_ATTRIBUTES.filter((a) => !config.selected_attributes.includes(a.key)).map((attr) => (
                  <button
                    key={attr.key}
                    onClick={() => toggleAttribute(attr.key)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded border border-neutral-800 hover:border-neutral-600 transition text-left"
                  >
                    <div className="w-4 h-4 rounded border border-neutral-700" />
                    <span className="text-sm">{attr.label}</span>
                    <span className="ml-auto text-xs text-neutral-600">{attr.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected (checked, ordered) */}
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Selected ({config.selected_attributes.length})</h3>
              <div className="space-y-1">
                {config.selected_attributes.map((key, idx) => {
                  const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
                  if (!attr) return null
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 px-4 py-2.5 rounded border border-neutral-700 bg-neutral-900/50"
                    >
                      <button onClick={() => toggleAttribute(key)}>
                        <div className="w-4 h-4 rounded border border-white bg-white flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="2">
                            <path d="M2 5l2 2 4-4" />
                          </svg>
                        </div>
                      </button>
                      <span className="text-sm flex-1">{attr.label}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveAttribute(key, 'up')}
                          disabled={idx === 0}
                          className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveAttribute(key, 'down')}
                          disabled={idx === config.selected_attributes.length - 1}
                          className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab B — Data Management */}
      {activeTab === 'management' && (
        <div className="space-y-8">
          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Filters</h2>
                <p className="text-sm text-neutral-500">Define which styles are included in this view.</p>
              </div>
              <button onClick={addFilter} className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition">
                Add Filter
              </button>
            </div>
            {config.filters.length === 0 && (
              <p className="text-neutral-600 text-sm">No filters — all styles will be shown.</p>
            )}
            <div className="space-y-3">
              {config.filters.map((filter, idx) => {
                const attr = STYLE_ATTRIBUTES.find((a) => a.key === filter.field)
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(idx, { field: e.target.value, value: '' })}
                      className={smallInputClass}
                    >
                      {STYLE_ATTRIBUTES.filter((a) => a.filterable).map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(idx, { operator: e.target.value as ViewFilter['operator'] })}
                      className={smallInputClass}
                    >
                      {FILTER_OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    {attr?.enumValues ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(idx, { value: e.target.value })}
                        className={`${smallInputClass} flex-1`}
                      >
                        <option value="">Select...</option>
                        {attr.enumValues.map((ev) => (
                          <option key={ev.value} value={ev.value}>{ev.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(idx, { value: e.target.value })}
                        placeholder="Value..."
                        className={`${smallInputClass} flex-1`}
                      />
                    )}
                    <button
                      onClick={() => removeFilter(idx)}
                      className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sort */}
          <div className="pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Sort</h2>
                <p className="text-sm text-neutral-500">Define the order styles appear in.</p>
              </div>
              <button onClick={addSort} className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition">
                Add Sort
              </button>
            </div>
            {config.sort.length === 0 && (
              <p className="text-neutral-600 text-sm">No sort rules — default order.</p>
            )}
            <div className="space-y-3">
              {config.sort.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={s.field}
                    onChange={(e) => updateSort(idx, { field: e.target.value })}
                    className={smallInputClass}
                  >
                    {STYLE_ATTRIBUTES.filter((a) => a.sortable).map((a) => (
                      <option key={a.key} value={a.key}>{a.label}</option>
                    ))}
                  </select>
                  <select
                    value={s.direction}
                    onChange={(e) => updateSort(idx, { direction: e.target.value as 'asc' | 'desc' })}
                    className={smallInputClass}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <button
                    onClick={() => removeSort(idx)}
                    className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Group By */}
          <div className="pt-6 border-t border-neutral-800">
            <h2 className="text-lg font-semibold mb-1">Group By</h2>
            <p className="text-sm text-neutral-500 mb-4">Group styles by one or more attributes.</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_ATTRIBUTES.filter((a) => a.groupable).map((attr) => (
                <button
                  key={attr.key}
                  onClick={() => toggleGroupBy(attr.key)}
                  className={`px-4 py-2 text-sm rounded border transition ${
                    config.group_by.includes(attr.key)
                      ? 'border-white bg-white text-black font-medium'
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                  }`}
                >
                  {attr.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab C — Display Options */}
      {activeTab === 'display' && (
        <div className="space-y-8">
          {/* View Type */}
          <div>
            <h2 className="text-lg font-semibold mb-4">View Type</h2>
            <div className="flex gap-3">
              {(['gallery', 'grid'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateConfig({ type: t })}
                  className={`px-6 py-3 rounded border text-sm font-medium transition ${
                    config.type === t
                      ? 'border-white bg-white text-black'
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                  }`}
                >
                  {t === 'gallery' ? 'Gallery (Cards)' : 'Grid (Table)'}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery-specific options */}
          {config.type === 'gallery' && (
            <>
              <div className="pt-6 border-t border-neutral-800">
                <h2 className="text-lg font-semibold mb-4">Gallery Layout</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Items per Row</label>
                    <select
                      value={config.display_options.items_per_row}
                      onChange={(e) => updateConfig({ display_options: { ...config.display_options, items_per_row: parseInt(e.target.value) } })}
                      className={inputClass}
                    >
                      {[2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Size</label>
                    <select
                      value={config.display_options.image_size}
                      onChange={(e) => updateConfig({ display_options: { ...config.display_options, image_size: e.target.value as 'small' | 'medium' | 'large' } })}
                      className={inputClass}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800">
                <h2 className="text-lg font-semibold mb-1">Card Attributes</h2>
                <p className="text-sm text-neutral-500 mb-4">Choose which attributes appear below the image on each card.</p>
                <div className="flex flex-wrap gap-2">
                  {config.selected_attributes
                    .filter((key) => key !== 'images')
                    .map((key) => {
                      const attr = STYLE_ATTRIBUTES.find((a) => a.key === key)
                      if (!attr) return null
                      const isCardAttr = config.display_options.card_attributes.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            const cardAttrs = isCardAttr
                              ? config.display_options.card_attributes.filter((a) => a !== key)
                              : [...config.display_options.card_attributes, key]
                            updateConfig({ display_options: { ...config.display_options, card_attributes: cardAttrs } })
                          }}
                          className={`px-3 py-1.5 text-sm rounded border transition ${
                            isCardAttr
                              ? 'border-white bg-white text-black font-medium'
                              : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                          }`}
                        >
                          {attr.label}
                        </button>
                      )
                    })}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="pt-6 border-t border-neutral-800">
            <h2 className="text-lg font-semibold mb-4">Pagination</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Items per Page</label>
                <select
                  value={config.display_options.items_per_page}
                  onChange={(e) => updateConfig({ display_options: { ...config.display_options, items_per_page: parseInt(e.target.value) } })}
                  className={inputClass}
                >
                  {[12, 24, 48, 96].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.display_options.show_pagination}
                    onChange={(e) => updateConfig({ display_options: { ...config.display_options, show_pagination: e.target.checked } })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show pagination controls</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab D — View Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">View Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              className={inputClass}
              placeholder="e.g. Shirts – Style Gallery"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.is_default}
                onChange={(e) => updateConfig({ is_default: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Set as default view</span>
            </label>
          </div>

          <div className="pt-6 border-t border-neutral-800">
            <h2 className="text-lg font-semibold mb-4">Export Options (PDF)</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Header Text</label>
                <input
                  type="text"
                  value={config.export_options.header_text}
                  onChange={(e) => updateConfig({ export_options: { ...config.export_options, header_text: e.target.value } })}
                  className={inputClass}
                  placeholder="e.g. SS27 > RTW > Men > Shirts"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Page Size</label>
                  <select
                    value={config.export_options.page_size}
                    onChange={(e) => updateConfig({ export_options: { ...config.export_options, page_size: e.target.value as 'a4' | 'letter' } })}
                    className={inputClass}
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.export_options.include_images}
                    onChange={(e) => updateConfig({ export_options: { ...config.export_options, include_images: e.target.checked } })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Include images in export</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.export_options.include_header}
                    onChange={(e) => updateConfig({ export_options: { ...config.export_options, include_header: e.target.checked } })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Include page header</span>
                </label>
              </div>
            </div>
          </div>

          {/* Delete */}
          {isEdit && (
            <div className="pt-6 border-t border-neutral-800">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 text-red-400 border border-red-900 rounded hover:bg-red-900/30 transition"
                >
                  Delete View
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-400">Delete this view permanently?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
