'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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
  customer_abbreviation: string | null
  logo_description: string | null
  notes: string | null
  created_at: string
  colours: { colour_name: string; hex_value: string | null; colour_code: string; g1_code: string | null } | null
}

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

function generateSkuCode(productName: string, colourCode: string, customerAbbr: string): string {
  const prod = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROD'
  const parts = [prod, colourCode]
  if (customerAbbr) parts.push(customerAbbr.toUpperCase())
  return parts.join('-')
}

export default function SKUTab({ styleId, styleName }: { styleId: string; styleName: string }) {
  const [skus, setSkus] = useState<ProductSKU[]>([])
  const [productColours, setProductColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [colourId, setColourId] = useState('')
  const [customerAbbreviation, setCustomerAbbreviation] = useState('')
  const [logoDescription, setLogoDescription] = useState('')
  const [notes, setNotes] = useState('')

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

  const resetForm = () => {
    setColourId('')
    setCustomerAbbreviation('')
    setLogoDescription('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (sku: ProductSKU) => {
    setColourId(sku.colour_id || '')
    setCustomerAbbreviation(sku.customer_abbreviation || '')
    setLogoDescription(sku.logo_description || '')
    setNotes(sku.notes || '')
    setEditingId(sku.id)
    setShowForm(true)
  }

  const selectedColour = productColours.find((c) => c.id === colourId)

  const previewSkuCode = colourId && selectedColour
    ? generateSkuCode(styleName, selectedColour.colour_code, customerAbbreviation)
    : ''

  const handleSave = async () => {
    if (!colourId) {
      toast.error('Colour is required')
      return
    }

    const colour = productColours.find((c) => c.id === colourId)
    if (!colour) return

    const skuCode = generateSkuCode(styleName, colour.colour_code, customerAbbreviation)

    const payload = {
      style_id: styleId,
      sku_code: skuCode,
      colour_id: colourId,
      colour_name: colour.colour_name,
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
            Auto-generated — format: <span className="font-mono text-neutral-400">PRODUCT-COLOUR[-CUSTOMER]</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + Generate SKU
        </button>
      </div>

      {showForm && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">
            {editingId ? 'Edit SKU' : 'New SKU'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour *</label>
              <div className="space-y-2">
                {productColours.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition ${
                      colourId === c.id ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sku-colour"
                      value={c.id}
                      checked={colourId === c.id}
                      onChange={() => setColourId(c.id)}
                      className="accent-white"
                    />
                    <div
                      className="w-5 h-5 rounded border border-neutral-700"
                      style={{ backgroundColor: c.hex_value || '#333' }}
                    />
                    <div>
                      <span className="text-sm text-white">{c.colour_name}</span>
                      <span className="text-xs text-neutral-500 font-mono ml-2">{c.colour_code}</span>
                      {c.g1_code && (
                        <span className="text-[10px] text-neutral-600 font-mono ml-2">GS1: {c.g1_code}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Customer Abbreviation</label>
                <input
                  type="text"
                  value={customerAbbreviation}
                  onChange={(e) => setCustomerAbbreviation(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. DCOP, ACME (leave empty for blank)"
                />
                <p className="text-xs text-neutral-600 mt-1">Differentiates branded vs blank product</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Logo / Branding</label>
                <input
                  type="text"
                  value={logoDescription}
                  onChange={(e) => setLogoDescription(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Dan's COP logo center front"
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
          </div>

          {previewSkuCode && (
            <div className="flex gap-6 py-2 px-3 bg-neutral-900/50 rounded border border-neutral-800/50">
              <div>
                <span className="text-xs text-neutral-500">Generated SKU</span>
                <div className="text-sm text-white font-mono font-medium">{previewSkuCode}</div>
              </div>
              {selectedColour?.g1_code && (
                <div>
                  <span className="text-xs text-neutral-500">GS1 Code</span>
                  <div className="text-sm text-white font-mono">{selectedColour.g1_code}</div>
                </div>
              )}
              <div className="text-xs text-neutral-600 self-end">Auto-generated</div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSave} className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition">
              {editingId ? 'Update' : 'Create SKU'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {skus.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          No SKUs generated yet. Click &quot;Generate SKU&quot; to create from assigned colours.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Colour</th>
                <th className="text-left px-4 py-3 font-medium">SKU Code</th>
                <th className="text-left px-4 py-3 font-medium">GS1</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Logo / Branding</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr key={sku.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {sku.colours?.hex_value && (
                        <div className="w-5 h-5 rounded border border-neutral-700" style={{ backgroundColor: sku.colours.hex_value }} />
                      )}
                      <span className="text-neutral-300 text-xs">{sku.colours?.colour_name || sku.colour_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-mono text-xs">{sku.sku_code}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{sku.colours?.g1_code || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.customer_abbreviation || 'Blank'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{sku.logo_description || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{sku.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => handleEdit(sku)} className="text-neutral-500 hover:text-white text-xs mr-3">Edit</button>
                    <button type="button" onClick={() => handleDelete(sku.id)} className="text-neutral-500 hover:text-red-400 text-xs">Delete</button>
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
