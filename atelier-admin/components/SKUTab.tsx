'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Colour {
  id: string
  colour_name: string
  hex_value: string | null
}

interface ProductSKU {
  id: string
  style_id: string
  colour_id: string | null
  sku_code: string
  colour_name: string | null
  customer_abbreviation: string | null
  logo_description: string | null
  notes: string | null
  created_at: string
  styles: { name: string; categories: { name: string } | null } | null
  colours: { colour_name: string; hex_value: string | null } | null
}

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

export default function SKUTab({ styleId, styleName }: { styleId: string; styleName: string }) {
  const [skus, setSkus] = useState<ProductSKU[]>([])
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [skuCode, setSkuCode] = useState('')
  const [colourId, setColourId] = useState('')
  const [colourName, setColourName] = useState('')
  const [customerAbbreviation, setCustomerAbbreviation] = useState('')
  const [logoDescription, setLogoDescription] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/product-skus?styleId=${styleId}`).then((r) => r.json()),
      fetch('/api/colours').then((r) => r.json()),
    ]).then(([skuData, colourData]) => {
      setSkus(skuData)
      setColours(colourData)
      setLoading(false)
    })
  }, [styleId])

  const resetForm = () => {
    setSkuCode('')
    setColourId('')
    setColourName('')
    setCustomerAbbreviation('')
    setLogoDescription('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (sku: ProductSKU) => {
    setSkuCode(sku.sku_code)
    setColourId(sku.colour_id || '')
    setColourName(sku.colour_name || '')
    setCustomerAbbreviation(sku.customer_abbreviation || '')
    setLogoDescription(sku.logo_description || '')
    setNotes(sku.notes || '')
    setEditingId(sku.id)
    setShowForm(true)
  }

  const handleColourSelect = (id: string) => {
    setColourId(id)
    if (id) {
      const c = colours.find((c) => c.id === id)
      if (c) setColourName(c.colour_name)
    }
  }

  const handleSave = async () => {
    if (!skuCode) {
      toast.error('SKU code is required')
      return
    }

    const payload = {
      style_id: styleId,
      sku_code: skuCode,
      colour_id: colourId || null,
      colour_name: colourName || null,
      customer_abbreviation: customerAbbreviation || null,
      logo_description: logoDescription || null,
      notes: notes || null,
    }

    const res = editingId
      ? await fetch('/api/product-skus', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch('/api/product-skus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    if (res.ok) {
      toast.success(editingId ? 'SKU updated' : 'SKU created')
      resetForm()
      const refreshRes = await fetch(`/api/product-skus?styleId=${styleId}`)
      if (refreshRes.ok) setSkus(await refreshRes.json())
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">SKU Overview</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Product-specific SKUs — each SKU represents a unique combination of product + colour + customization
          </p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + Add SKU
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">
            {editingId ? 'Edit SKU' : 'New SKU'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">SKU Code *</label>
              <input
                type="text"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                className={inputClass}
                placeholder="e.g. TS-COC-BLK-LP"
              />
              <p className="text-xs text-neutral-600 mt-1">Product + colour + customization identifier</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Customer Abbreviation</label>
              <input
                type="text"
                value={customerAbbreviation}
                onChange={(e) => setCustomerAbbreviation(e.target.value)}
                className={inputClass}
                placeholder="e.g. ACME-TS-BLK"
              />
              <p className="text-xs text-neutral-600 mt-1">Product name, category, customer short code</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour (from library)</label>
              <select
                value={colourId}
                onChange={(e) => handleColourSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">Select colour...</option>
                {colours.map((c) => (
                  <option key={c.id} value={c.id}>{c.colour_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Name (override)</label>
              <input
                type="text"
                value={colourName}
                onChange={(e) => setColourName(e.target.value)}
                className={inputClass}
                placeholder="Auto-filled from colour library"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Logo / Customization</label>
              <input
                type="text"
                value={logoDescription}
                onChange={(e) => setLogoDescription(e.target.value)}
                className={inputClass}
                placeholder="e.g. Logo print center front"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SKU Table */}
      {skus.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          No SKUs created for this product yet.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Colour</th>
                <th className="text-left px-4 py-3 font-medium">SKU Code</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Customer Abbr.</th>
                <th className="text-left px-4 py-3 font-medium">Logo / Customization</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr key={sku.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(sku.colours?.hex_value) && (
                        <div
                          className="w-5 h-5 rounded border border-neutral-700"
                          style={{ backgroundColor: sku.colours.hex_value }}
                        />
                      )}
                      <span className="text-neutral-300 text-xs">
                        {sku.colours?.colour_name || sku.colour_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-mono text-xs">{sku.sku_code}</td>
                  <td className="px-4 py-3 text-neutral-300">{styleName}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.customer_abbreviation || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.logo_description || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{sku.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEdit(sku)}
                      className="text-neutral-500 hover:text-white text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sku.id)}
                      className="text-neutral-500 hover:text-red-400 text-xs"
                    >
                      Delete
                    </button>
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
