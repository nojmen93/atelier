'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import BulkVariantModal from './BulkVariantModal'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export interface Variant {
  id: string
  style_id: string
  size: string | null
  color: string | null
  sku: string | null
  stock: number
  price_modifier: number
}

interface VariantTableProps {
  styleId: string
  styleName: string
}

function generateSku(styleName: string, size: string, color: string): string {
  const code = styleName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((w) => w.substring(0, 2).toUpperCase())
    .join('')
    .substring(0, 4)
  const s = size.toUpperCase().substring(0, 3)
  const c = color
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
  return `${code}-${s}-${c}`
}

interface EditingState {
  id: string | null
  size: string
  color: string
  sku: string
  stock: string
  priceModifier: string
  manualSku: boolean
}

const emptyEdit: EditingState = {
  id: null,
  size: '',
  color: '',
  sku: '',
  stock: '0',
  priceModifier: '0',
  manualSku: false,
}

export default function VariantTable({ styleId, styleName }: VariantTableProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showBulk, setShowBulk] = useState(false)
  const supabase = createClient()

  const fetchVariants = useCallback(async () => {
    const { data } = await supabase
      .from('variants')
      .select('*')
      .eq('style_id', styleId)
      .order('size')
      .order('color')
    setVariants(data || [])
    setLoading(false)
  }, [styleId, supabase])

  useEffect(() => {
    fetchVariants()
  }, [fetchVariants])

  const updateAutoSku = (edit: EditingState): EditingState => {
    if (edit.manualSku) return edit
    if (edit.size && edit.color) {
      return { ...edit, sku: generateSku(styleName, edit.size, edit.color) }
    }
    return edit
  }

  const handleFieldChange = (field: keyof EditingState, value: string) => {
    if (!editing) return
    const updated = { ...editing, [field]: value }
    if (field === 'sku') {
      updated.manualSku = true
    }
    setEditing(field === 'size' || field === 'color' ? updateAutoSku(updated) : updated)
  }

  const handleStartAdd = () => {
    setEditing({ ...emptyEdit })
  }

  const handleStartEdit = (v: Variant) => {
    setEditing({
      id: v.id,
      size: v.size || '',
      color: v.color || '',
      sku: v.sku || '',
      stock: v.stock.toString(),
      priceModifier: v.price_modifier.toString(),
      manualSku: true,
    })
  }

  const handleCancel = () => {
    setEditing(null)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)

    const payload = {
      style_id: styleId,
      size: editing.size || null,
      color: editing.color || null,
      sku: editing.sku || null,
      stock: parseInt(editing.stock) || 0,
      price_modifier: parseFloat(editing.priceModifier) || 0,
    }

    if (editing.id) {
      const { error } = await supabase
        .from('variants')
        .update(payload)
        .eq('id', editing.id)
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('variants').insert(payload)
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
    }

    setEditing(null)
    setSaving(false)
    fetchVariants()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('variants').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      setVariants((prev) => prev.filter((v) => v.id !== id))
    }
    setDeletingId(null)
  }

  const handleBulkCreated = () => {
    setShowBulk(false)
    fetchVariants()
  }

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-neutral-800">
        <h2 className="text-xl font-semibold mb-6">Variants</h2>
        <p className="text-neutral-500 text-sm">Loading variants...</p>
      </div>
    )
  }

  const inputClass =
    'px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:border-neutral-500 focus:outline-none'

  return (
    <div className="mt-12 pt-8 border-t border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Variants
          {variants.length > 0 && (
            <span className="ml-2 text-sm font-normal text-neutral-500">
              ({variants.length})
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowBulk(true)}
            className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
          >
            Quick Add
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            disabled={editing !== null}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            Add Variant
          </button>
        </div>
      </div>

      {variants.length === 0 && !editing && (
        <p className="text-neutral-500 text-sm">No variants yet. Add sizes, colors, and stock levels.</p>
      )}

      {(variants.length > 0 || editing) && (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Color</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-right px-4 py-3 font-medium">Price +/-</th>
                <th className="text-right px-4 py-3 font-medium w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) =>
                editing?.id === v.id ? (
                  <tr key={v.id} className="border-b border-neutral-800 bg-neutral-900/50">
                    <td className="px-4 py-2">
                      <select
                        value={editing.size}
                        onChange={(e) => handleFieldChange('size', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editing.color}
                        onChange={(e) => handleFieldChange('color', e.target.value)}
                        placeholder="e.g. Black"
                        className={`${inputClass} w-28`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editing.sku}
                        onChange={(e) => handleFieldChange('sku', e.target.value)}
                        className={`${inputClass} w-32 font-mono text-xs`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={editing.stock}
                        onChange={(e) => handleFieldChange('stock', e.target.value)}
                        className={`${inputClass} w-20 text-right`}
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editing.priceModifier}
                        onChange={(e) => handleFieldChange('priceModifier', e.target.value)}
                        className={`${inputClass} w-24 text-right`}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition"
                        >
                          {saving ? '...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-3 py-1 text-xs text-neutral-400 hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={v.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/30">
                    <td className="px-4 py-3">
                      {v.size ? (
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-200 rounded text-xs font-medium">
                          {v.size}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{v.color || <span className="text-neutral-600">—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">{v.sku || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={v.stock === 0 ? 'text-red-400' : 'text-neutral-200'}>
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-400">
                      {v.price_modifier !== 0 && (
                        <span className={v.price_modifier > 0 ? 'text-green-400' : 'text-red-400'}>
                          {v.price_modifier > 0 ? '+' : ''}{Number(v.price_modifier).toFixed(2)}
                        </span>
                      )}
                      {v.price_modifier === 0 && <span className="text-neutral-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(v)}
                          disabled={editing !== null}
                          className="px-3 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-700 rounded hover:border-neutral-500 transition disabled:opacity-30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="px-3 py-1 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded hover:border-red-700 transition"
                        >
                          {deletingId === v.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {editing && editing.id === null && (
                <tr className="bg-neutral-900/50">
                  <td className="px-4 py-2">
                    <select
                      value={editing.size}
                      onChange={(e) => handleFieldChange('size', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editing.color}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      placeholder="e.g. Black"
                      className={`${inputClass} w-28`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editing.sku}
                      onChange={(e) => handleFieldChange('sku', e.target.value)}
                      className={`${inputClass} w-32 font-mono text-xs`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={editing.stock}
                      onChange={(e) => handleFieldChange('stock', e.target.value)}
                      className={`${inputClass} w-20 text-right`}
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editing.priceModifier}
                      onChange={(e) => handleFieldChange('priceModifier', e.target.value)}
                      className={`${inputClass} w-24 text-right`}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition"
                      >
                        {saving ? '...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs text-neutral-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showBulk && (
        <BulkVariantModal
          styleId={styleId}
          styleName={styleName}
          onClose={() => setShowBulk(false)}
          onCreated={handleBulkCreated}
        />
      )}
    </div>
  )
}
