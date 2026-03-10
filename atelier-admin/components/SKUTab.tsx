'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import RowActions from './RowActions'

interface Colour {
  id: string
  colour_name: string
  colour_code: string
  hex_value: string | null
  g1_code: string | null
}

interface ProductSKU {
  id: string
  style_id: string
  colour_id: string | null
  sku_code: string
  colour_name: string | null
  size: string | null
  customer_abbreviation: string | null
  logo_description: string | null
  notes: string | null
  created_at: string
  colours: { colour_name: string; hex_value: string | null; colour_code: string; g1_code: string | null } | null
}

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

function generateSkuCode(productName: string, colourCode: string, size: string, customerAbbr: string): string {
  const prod = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROD'
  const parts = [prod, colourCode]
  if (size) parts.push(size)
  if (customerAbbr) parts.push(customerAbbr.toUpperCase())
  return parts.join('-')
}

export default function SKUTab({ styleId, styleName }: { styleId: string; styleName: string }) {
  const [skus, setSkus] = useState<ProductSKU[]>([])
  const [productColours, setProductColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state — creation
  const [showModal, setShowModal] = useState(false)
  const [selectedColourIds, setSelectedColourIds] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customerAbbreviation, setCustomerAbbreviation] = useState('')
  const [logoDescription, setLogoDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Inline edit state (for single SKU editing)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editColourId, setEditColourId] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editCustomerAbbr, setEditCustomerAbbr] = useState('')
  const [editLogo, setEditLogo] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/product-skus?styleId=${styleId}`).then((r) => r.json()),
      fetch(`/api/style-colours?styleId=${styleId}`).then((r) => r.json()),
    ]).then(([skuData, styleColourData]) => {
      setSkus(Array.isArray(skuData) ? skuData : [])
      const colours = Array.isArray(styleColourData)
        ? styleColourData.map((sc: { colour: Colour }) => sc.colour).filter(Boolean)
        : []
      setProductColours(colours)
      setLoading(false)
    })
  }, [styleId])

  const refreshSkus = async () => {
    const res = await fetch(`/api/product-skus?styleId=${styleId}`)
    if (res.ok) setSkus(await res.json())
  }

  // ─── Create modal helpers ───
  const openCreateModal = () => {
    // Pre-select all colours & sizes
    setSelectedColourIds(productColours.map((c) => c.id))
    setSelectedSizes([...SIZES])
    setCustomerAbbreviation('')
    setLogoDescription('')
    setNotes('')
    setShowModal(true)
  }

  const toggleColour = (id: string) => {
    setSelectedColourIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const skuPreviewCount = selectedColourIds.length * Math.max(selectedSizes.length, 1)

  const handleBulkCreate = async () => {
    if (selectedColourIds.length === 0) {
      toast.error('Select at least one colour')
      return
    }

    setSaving(true)

    const rows = selectedColourIds.flatMap((colourId) => {
      const colour = productColours.find((c) => c.id === colourId)
      if (!colour) return []

      const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ['']

      return sizesToUse.map((size) => ({
        style_id: styleId,
        sku_code: generateSkuCode(styleName, colour.colour_code, size, customerAbbreviation),
        colour_id: colourId,
        colour_name: colour.colour_name,
        size: size || null,
        customer_abbreviation: customerAbbreviation || null,
        logo_description: logoDescription || null,
        notes: notes || null,
      }))
    })

    const res = await fetch('/api/product-skus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    })

    if (res.ok) {
      toast.success(`${rows.length} SKU${rows.length !== 1 ? 's' : ''} created`)
      setShowModal(false)
      await refreshSkus()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create SKUs')
    }

    setSaving(false)
  }

  // ─── Edit helpers ───
  const handleEdit = (sku: ProductSKU) => {
    setEditingId(sku.id)
    setEditColourId(sku.colour_id || '')
    setEditSize(sku.size || '')
    setEditCustomerAbbr(sku.customer_abbreviation || '')
    setEditLogo(sku.logo_description || '')
    setEditNotes(sku.notes || '')
    setShowEditForm(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowEditForm(false)
  }

  const handleUpdate = async () => {
    if (!editingId || !editColourId) return

    const colour = productColours.find((c) => c.id === editColourId)
    if (!colour) return

    const res = await fetch('/api/product-skus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        colour_id: editColourId,
        colour_name: colour.colour_name,
        size: editSize || null,
        sku_code: generateSkuCode(styleName, colour.colour_code, editSize, editCustomerAbbr),
        customer_abbreviation: editCustomerAbbr || null,
        logo_description: editLogo || null,
        notes: editNotes || null,
      }),
    })

    if (res.ok) {
      toast.success('SKU updated')
      cancelEdit()
      await refreshSkus()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to update')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/product-skus', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      toast.success('SKU deleted')
      setSkus((prev) => prev.filter((s) => s.id !== id))
    } else {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="text-neutral-500 text-sm py-8 text-center">Loading SKUs...</div>
  }

  if (productColours.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">SKU Overview</h2>
        <div className="border border-yellow-900/50 bg-yellow-950/20 rounded-lg p-6 text-center space-y-3">
          <div className="text-yellow-200 text-sm font-medium">No colours assigned to this product</div>
          <p className="text-xs text-neutral-400">
            SKUs are generated from product colours. Please assign colours first in the Colourways tab.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">SKU Overview</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Format: <span className="font-mono text-neutral-400">PRODUCT-COLOUR-SIZE[-CUSTOMER]</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + Create SKU
        </button>
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowModal(false)}>
          <div
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create SKUs</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white text-xl leading-none">&times;</button>
            </div>

            {/* Colours multi-select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-neutral-500 font-medium">Colours</label>
                <button
                  type="button"
                  onClick={() => setSelectedColourIds(
                    selectedColourIds.length === productColours.length ? [] : productColours.map((c) => c.id)
                  )}
                  className="text-xs text-neutral-500 hover:text-white transition"
                >
                  {selectedColourIds.length === productColours.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productColours.map((c) => {
                  const selected = selectedColourIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColour(c.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition ${
                        selected
                          ? 'border-white bg-neutral-800 text-white'
                          : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded border border-neutral-600"
                        style={{ backgroundColor: c.hex_value || '#333' }}
                      />
                      {c.colour_name}
                      <span className="font-mono text-neutral-600">{c.colour_code}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sizes multi-select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-neutral-500 font-medium">Sizes</label>
                <button
                  type="button"
                  onClick={() => setSelectedSizes(
                    selectedSizes.length === SIZES.length ? [] : [...SIZES]
                  )}
                  className="text-xs text-neutral-500 hover:text-white transition"
                >
                  {selectedSizes.length === SIZES.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const selected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                        selected
                          ? 'border-white bg-neutral-800 text-white'
                          : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Customer Abbreviation</label>
                <input
                  type="text"
                  value={customerAbbreviation}
                  onChange={(e) => setCustomerAbbreviation(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. DCOP, ACME"
                />
                <p className="text-xs text-neutral-600 mt-1">Leave empty for blank product</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Logo / Branding</label>
                <input
                  type="text"
                  value={logoDescription}
                  onChange={(e) => setLogoDescription(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Logo center front"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </div>

            {/* Preview */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-900/50 rounded border border-neutral-800/50">
              <div className="text-xs text-neutral-400">
                {skuPreviewCount} SKU{skuPreviewCount !== 1 ? 's' : ''} will be created
                <span className="text-neutral-600 ml-2">
                  ({selectedColourIds.length} colour{selectedColourIds.length !== 1 ? 's' : ''} &times; {Math.max(selectedSizes.length, 1)} size{selectedSizes.length !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBulkCreate}
                disabled={saving || selectedColourIds.length === 0}
                className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40"
              >
                {saving ? 'Creating...' : 'Create SKUs'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Form (inline) ── */}
      {showEditForm && editingId && (
        <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">Edit SKU</h3>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour</label>
              <select value={editColourId} onChange={(e) => setEditColourId(e.target.value)} className={inputClass}>
                {productColours.map((c) => (
                  <option key={c.id} value={c.id}>{c.colour_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Size</label>
              <select value={editSize} onChange={(e) => setEditSize(e.target.value)} className={inputClass}>
                <option value="">No size</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Customer Abbr.</label>
              <input type="text" value={editCustomerAbbr} onChange={(e) => setEditCustomerAbbr(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Logo / Branding</label>
              <input type="text" value={editLogo} onChange={(e) => setEditLogo(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Notes</label>
              <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleUpdate} className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition">
              Update
            </button>
            <button type="button" onClick={cancelEdit} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SKU Table ── */}
      {skus.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          No SKUs generated yet. Click &quot;Create SKU&quot; to generate from assigned colours and sizes.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Colour</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">SKU Code</th>
                <th className="text-left px-4 py-3 font-medium">GS1</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Logo / Branding</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
                <th className="text-right px-4 py-3 font-medium w-28"></th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr key={sku.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {sku.colours?.hex_value && (
                        <div className="w-4 h-4 rounded border border-neutral-700" style={{ backgroundColor: sku.colours.hex_value }} />
                      )}
                      <span className="text-neutral-300 text-xs">{sku.colours?.colour_name || sku.colour_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300 font-mono text-xs">{sku.size || '—'}</td>
                  <td className="px-4 py-3 text-white font-mono text-xs">{sku.sku_code}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{sku.colours?.g1_code || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.customer_abbreviation || 'Blank'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.logo_description || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{sku.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => handleEdit(sku)}
                      onDelete={() => handleDelete(sku.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-neutral-600">
        {skus.length} SKU{skus.length !== 1 ? 's' : ''} for {styleName}
      </div>
    </div>
  )
}
