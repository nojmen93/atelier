'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Supplier {
  id: string
  name: string
}

interface Colour {
  id: string
  colour_name: string
  hex_value: string | null
}

interface SupplierQuote {
  id: string
  style_id: string
  supplier_id: string
  colour_id: string | null
  colour_name: string | null
  volume_from: number
  volume_to: number | null
  currency: string
  vendor_price: number | null
  exchange_rate: number | null
  duty_pct: number | null
  freight_cost: number | null
  surcharge: number | null
  landed_cost: number | null
  notes: string | null
  valid_from: string | null
  valid_to: string | null
  created_at: string
  suppliers: { name: string } | null
  colours: { colour_name: string; hex_value: string | null } | null
}

type FormStep = 'initial' | 'details'

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

export default function SupplierQuoteTab({
  styleId,
  suppliers,
}: {
  styleId: string
  suppliers: Supplier[]
}) {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([])
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [formStep, setFormStep] = useState<FormStep | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Step 1: Initial info
  const [supplierId, setSupplierId] = useState('')
  const [volumeFrom, setVolumeFrom] = useState('')
  const [volumeTo, setVolumeTo] = useState('')
  const [colourId, setColourId] = useState('')
  const [colourName, setColourName] = useState('')
  const [currency, setCurrency] = useState('EUR')

  // Step 2: Cost details
  const [vendorPrice, setVendorPrice] = useState('')
  const [exchangeRate, setExchangeRate] = useState('1.0')
  const [dutyPct, setDutyPct] = useState('0')
  const [freightCost, setFreightCost] = useState('0')
  const [surcharge, setSurcharge] = useState('0')
  const [notes, setNotes] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/supplier-quotes?styleId=${styleId}`).then((r) => r.json()),
      fetch('/api/colours').then((r) => r.json()),
    ]).then(([quoteData, colourData]) => {
      setQuotes(Array.isArray(quoteData) ? quoteData : [])
      setColours(Array.isArray(colourData) ? colourData : [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [styleId])

  const resetForm = () => {
    setSupplierId('')
    setVolumeFrom('')
    setVolumeTo('')
    setColourId('')
    setColourName('')
    setCurrency('EUR')
    setVendorPrice('')
    setExchangeRate('1.0')
    setDutyPct('0')
    setFreightCost('0')
    setSurcharge('0')
    setNotes('')
    setValidFrom('')
    setValidTo('')
    setEditingId(null)
    setFormStep(null)
  }

  const handleEdit = (q: SupplierQuote) => {
    setSupplierId(q.supplier_id)
    setVolumeFrom(q.volume_from.toString())
    setVolumeTo(q.volume_to?.toString() || '')
    setColourId(q.colour_id || '')
    setColourName(q.colour_name || '')
    setCurrency(q.currency)
    setVendorPrice(q.vendor_price?.toString() || '')
    setExchangeRate(q.exchange_rate?.toString() || '1.0')
    setDutyPct(q.duty_pct?.toString() || '0')
    setFreightCost(q.freight_cost?.toString() || '0')
    setSurcharge(q.surcharge?.toString() || '0')
    setNotes(q.notes || '')
    setValidFrom(q.valid_from || '')
    setValidTo(q.valid_to || '')
    setEditingId(q.id)
    setFormStep('details')
  }

  // Calculate landed cost
  const calcLandedCost = () => {
    const vp = parseFloat(vendorPrice) || 0
    const er = parseFloat(exchangeRate) || 1
    const duty = parseFloat(dutyPct) || 0
    const freight = parseFloat(freightCost) || 0
    const sc = parseFloat(surcharge) || 0

    const baseInEur = vp * er
    const withDuty = baseInEur * (1 + duty / 100)
    return withDuty + freight + sc
  }

  const handleSaveInitial = () => {
    if (!supplierId || !volumeFrom) {
      toast.error('Supplier and volume from are required')
      return
    }
    setFormStep('details')
  }

  const handleSaveDetails = async () => {
    const landed = calcLandedCost()

    const payload = {
      style_id: styleId,
      supplier_id: supplierId,
      colour_id: colourId || null,
      colour_name: colourName || null,
      volume_from: parseInt(volumeFrom),
      volume_to: volumeTo ? parseInt(volumeTo) : null,
      currency,
      vendor_price: vendorPrice ? parseFloat(vendorPrice) : null,
      exchange_rate: exchangeRate ? parseFloat(exchangeRate) : null,
      duty_pct: dutyPct ? parseFloat(dutyPct) : null,
      freight_cost: freightCost ? parseFloat(freightCost) : null,
      surcharge: surcharge ? parseFloat(surcharge) : null,
      landed_cost: landed > 0 ? parseFloat(landed.toFixed(2)) : null,
      notes: notes || null,
      valid_from: validFrom || null,
      valid_to: validTo || null,
    }

    const res = editingId
      ? await fetch('/api/supplier-quotes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch('/api/supplier-quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    if (res.ok) {
      toast.success(editingId ? 'Supplier quote updated' : 'Supplier quote created')
      resetForm()
      const refreshRes = await fetch(`/api/supplier-quotes?styleId=${styleId}`)
      if (refreshRes.ok) setQuotes(await refreshRes.json())
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/supplier-quotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      toast.success('Supplier quote deleted')
      setQuotes((prev) => prev.filter((q) => q.id !== id))
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleColourSelect = (id: string) => {
    setColourId(id)
    if (id) {
      const c = colours.find((c) => c.id === id)
      if (c) setColourName(c.colour_name)
    }
  }

  if (loading) {
    return <div className="text-neutral-500 text-sm py-8 text-center">Loading supplier quotes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Supplier Quotes</h2>
          <p className="text-xs text-neutral-500 mt-1">Supplier pricing for this product at different volumes</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setFormStep('initial') }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + New Supplier Quote
        </button>
      </div>

      {/* Step 1: Initial Info */}
      {formStep === 'initial' && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">New Supplier Quote &mdash; Key Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour</label>
              <select
                value={colourId}
                onChange={(e) => handleColourSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">Any / not specified</option>
                {colours.map((c) => (
                  <option key={c.id} value={c.id}>{c.colour_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Volume From *</label>
              <input
                type="number"
                value={volumeFrom}
                onChange={(e) => setVolumeFrom(e.target.value)}
                className={inputClass}
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Volume To</label>
              <input
                type="number"
                value={volumeTo}
                onChange={(e) => setVolumeTo(e.target.value)}
                className={inputClass}
                placeholder="e.g. 500 (leave empty for no cap)"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="DKK">DKK</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveInitial}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              Save &amp; Continue
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Cost Details */}
      {formStep === 'details' && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-300">
              {editingId ? 'Edit Supplier Quote' : 'Cost Details'} &mdash;{' '}
              {suppliers.find((s) => s.id === supplierId)?.name}
              {colourName ? ` / ${colourName}` : ''}
              {' '}({volumeFrom}{volumeTo ? `–${volumeTo}` : '+'} units)
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Vendor Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                value={vendorPrice}
                onChange={(e) => setVendorPrice(e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Exchange Rate (to EUR)</label>
              <input
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Duty %</label>
              <input
                type="number"
                step="0.1"
                value={dutyPct}
                onChange={(e) => setDutyPct(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Freight Cost (EUR)</label>
              <input
                type="number"
                step="0.01"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Surcharges (EUR)</label>
              <input
                type="number"
                step="0.01"
                value={surcharge}
                onChange={(e) => setSurcharge(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Landed Cost (EUR)</label>
              <div className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm font-mono">
                {calcLandedCost() > 0 ? `€${calcLandedCost().toFixed(2)}` : '—'}
              </div>
              <p className="text-xs text-neutral-600 mt-1">Auto-calculated</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Valid From</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Valid To</label>
              <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDetails}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            {!editingId && (
              <button
                type="button"
                onClick={() => setFormStep('initial')}
                className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Back
              </button>
            )}
            <button type="button" onClick={resetForm} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quotes Table */}
      {quotes.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          No supplier quotes for this product yet.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Supplier</th>
                <th className="text-left px-4 py-3 font-medium">Colour</th>
                <th className="text-left px-4 py-3 font-medium">Volume</th>
                <th className="text-right px-4 py-3 font-medium">Vendor Price</th>
                <th className="text-right px-4 py-3 font-medium">FX Rate</th>
                <th className="text-right px-4 py-3 font-medium">Duty</th>
                <th className="text-right px-4 py-3 font-medium">Freight</th>
                <th className="text-right px-4 py-3 font-medium">Surcharge</th>
                <th className="text-right px-4 py-3 font-medium">Landed</th>
                <th className="text-left px-4 py-3 font-medium">Validity</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-white">{q.suppliers?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {q.colours?.hex_value && (
                        <div className="w-4 h-4 rounded border border-neutral-700" style={{ backgroundColor: q.colours.hex_value }} />
                      )}
                      <span className="text-neutral-300 text-xs">{q.colours?.colour_name || q.colour_name || 'Any'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300 text-xs">
                    {q.volume_from}{q.volume_to ? `–${q.volume_to}` : '+'}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300 font-mono text-xs">
                    {q.vendor_price != null ? `${q.currency} ${q.vendor_price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-400 font-mono text-xs">{q.exchange_rate ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-neutral-400 font-mono text-xs">{q.duty_pct != null ? `${q.duty_pct}%` : '—'}</td>
                  <td className="px-4 py-3 text-right text-neutral-400 font-mono text-xs">{q.freight_cost != null ? `€${q.freight_cost.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-neutral-400 font-mono text-xs">{q.surcharge != null ? `€${q.surcharge.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-white font-mono text-xs font-medium">
                    {q.landed_cost != null ? `€${q.landed_cost.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {q.valid_from && q.valid_to
                      ? `${q.valid_from} – ${q.valid_to}`
                      : q.valid_from
                      ? `From ${q.valid_from}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => handleEdit(q)} className="text-neutral-500 hover:text-white text-xs mr-3">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(q.id)} className="text-neutral-500 hover:text-red-400 text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
