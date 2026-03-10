'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import RowActions from './RowActions'

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
  pricing_method: string | null
  shipping_country: string | null
  currency: string
  vendor_price: number | null
  material_cost: number | null
  material_cost_currency: string | null
  exchange_rate: number | null
  duty_pct: number | null
  freight_cost: number | null
  surcharge: number | null
  landed_cost: number | null
  target_margin_pct: number | null
  target_retail_price: number | null
  notes: string | null
  valid_from: string | null
  valid_to: string | null
  created_at: string
  suppliers: { name: string } | null
  colours: { colour_name: string; hex_value: string | null } | null
}

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'
const readOnlyClass = 'w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm font-mono'

const SHIPPING_COUNTRIES = [
  { value: 'CN', label: 'China' },
  { value: 'PT', label: 'Portugal' },
  { value: 'TR', label: 'Turkey' },
  { value: 'IN', label: 'India' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IT', label: 'Italy' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'OTHER', label: 'Other' },
]

// ─── Calculation helpers (matching spreadsheet formulas) ─────────────

function calcLanded(
  vendorPrice: number,
  exchangeRate: number,
  dutyPct: number,
  freightCost: number,
  surcharge: number,
  pricingMethod: string,
  materialCost: number,
) {
  // Base = vendor price converted to EUR
  // For CMT: material cost is added before conversion
  const base = pricingMethod === 'CMT'
    ? (vendorPrice + materialCost) * exchangeRate
    : vendorPrice * exchangeRate

  // Col M: Landed cost excl. customs & shipping = base in EUR
  const landedExclCustoms = base

  // Col N: Inbound customs & shipping = duty on base + freight + surcharge
  const inboundCustoms = base * (dutyPct / 100) + freightCost + surcharge

  // Col O: Total landed cost = M + N
  const landedCost = landedExclCustoms + inboundCustoms

  return { landedExclCustoms, inboundCustoms, landedCost }
}

function calcRetailPrice(landedCost: number, targetMarginPct: number): number {
  if (targetMarginPct >= 100 || targetMarginPct <= 0) return 0
  return landedCost / (1 - targetMarginPct / 100)
}

function calcMargin(landedCost: number, targetRetailPrice: number): number {
  if (targetRetailPrice <= 0) return 0
  return (1 - landedCost / targetRetailPrice) * 100
}

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
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state — key info
  const [supplierId, setSupplierId] = useState('')
  const [volumeFrom, setVolumeFrom] = useState('')
  const [volumeTo, setVolumeTo] = useState('')
  const [colourId, setColourId] = useState('')
  const [colourName, setColourName] = useState('')
  const [pricingMethod, setPricingMethod] = useState('FOB')
  const [shippingCountry, setShippingCountry] = useState('')
  const [currency, setCurrency] = useState('USD')

  // Form state — cost details
  const [vendorPrice, setVendorPrice] = useState('')
  const [materialCost, setMaterialCost] = useState('')
  const [materialCostCurrency, setMaterialCostCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('1.0')
  const [dutyPct, setDutyPct] = useState('0')
  const [freightCost, setFreightCost] = useState('0')
  const [surcharge, setSurcharge] = useState('0')

  // Form state — margin & pricing
  const [targetMarginPct, setTargetMarginPct] = useState('')
  const [targetRetailPrice, setTargetRetailPrice] = useState('')

  // Form state — validity & notes
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
    }).catch(() => setLoading(false))
  }, [styleId])

  const resetForm = () => {
    setSupplierId('')
    setVolumeFrom('')
    setVolumeTo('')
    setColourId('')
    setColourName('')
    setPricingMethod('FOB')
    setShippingCountry('')
    setCurrency('USD')
    setVendorPrice('')
    setMaterialCost('')
    setMaterialCostCurrency('USD')
    setExchangeRate('1.0')
    setDutyPct('0')
    setFreightCost('0')
    setSurcharge('0')
    setTargetMarginPct('')
    setTargetRetailPrice('')
    setNotes('')
    setValidFrom('')
    setValidTo('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (q: SupplierQuote) => {
    setSupplierId(q.supplier_id)
    setVolumeFrom(q.volume_from.toString())
    setVolumeTo(q.volume_to?.toString() || '')
    setColourId(q.colour_id || '')
    setColourName(q.colour_name || '')
    setPricingMethod(q.pricing_method || 'FOB')
    setShippingCountry(q.shipping_country || '')
    setCurrency(q.currency)
    setVendorPrice(q.vendor_price?.toString() || '')
    setMaterialCost(q.material_cost?.toString() || '')
    setMaterialCostCurrency(q.material_cost_currency || 'USD')
    setExchangeRate(q.exchange_rate?.toString() || '1.0')
    setDutyPct(q.duty_pct?.toString() || '0')
    setFreightCost(q.freight_cost?.toString() || '0')
    setSurcharge(q.surcharge?.toString() || '0')
    setTargetMarginPct(q.target_margin_pct?.toString() || '')
    setTargetRetailPrice(q.target_retail_price?.toString() || '')
    setNotes(q.notes || '')
    setValidFrom(q.valid_from || '')
    setValidTo(q.valid_to || '')
    setEditingId(q.id)
    setShowForm(true)
  }

  // Live calculations
  const liveCalc = useMemo(() => {
    const vp = parseFloat(vendorPrice) || 0
    const er = parseFloat(exchangeRate) || 1
    const duty = parseFloat(dutyPct) || 0
    const freight = parseFloat(freightCost) || 0
    const sc = parseFloat(surcharge) || 0
    const mc = parseFloat(materialCost) || 0
    const tmPct = parseFloat(targetMarginPct) || 0
    const trp = parseFloat(targetRetailPrice) || 0

    const { landedExclCustoms, inboundCustoms, landedCost } = calcLanded(
      vp, er, duty, freight, sc, pricingMethod, mc
    )

    const calculatedRetail = tmPct > 0 ? calcRetailPrice(landedCost, tmPct) : 0
    const calculatedMargin = trp > 0 ? calcMargin(landedCost, trp) : 0

    return { landedExclCustoms, inboundCustoms, landedCost, calculatedRetail, calculatedMargin }
  }, [vendorPrice, exchangeRate, dutyPct, freightCost, surcharge, materialCost, pricingMethod, targetMarginPct, targetRetailPrice])

  const handleColourSelect = (id: string) => {
    setColourId(id)
    if (id) {
      const c = colours.find((c) => c.id === id)
      if (c) setColourName(c.colour_name)
    }
  }

  const handleSave = async () => {
    if (!supplierId || !volumeFrom) {
      toast.error('Supplier and volume from are required')
      return
    }

    const payload = {
      style_id: styleId,
      supplier_id: supplierId,
      colour_id: colourId || null,
      colour_name: colourName || null,
      volume_from: parseInt(volumeFrom),
      volume_to: volumeTo ? parseInt(volumeTo) : null,
      pricing_method: pricingMethod,
      shipping_country: shippingCountry || null,
      currency,
      vendor_price: vendorPrice ? parseFloat(vendorPrice) : null,
      material_cost: materialCost ? parseFloat(materialCost) : null,
      material_cost_currency: materialCostCurrency || null,
      exchange_rate: exchangeRate ? parseFloat(exchangeRate) : null,
      duty_pct: dutyPct ? parseFloat(dutyPct) : null,
      freight_cost: freightCost ? parseFloat(freightCost) : null,
      surcharge: surcharge ? parseFloat(surcharge) : null,
      landed_cost: liveCalc.landedCost > 0 ? parseFloat(liveCalc.landedCost.toFixed(2)) : null,
      target_margin_pct: targetMarginPct ? parseFloat(targetMarginPct) : null,
      target_retail_price: targetRetailPrice ? parseFloat(targetRetailPrice) : null,
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

  // Calculate derived values for a saved quote row
  const quoteCalc = (q: SupplierQuote) => {
    const vp = q.vendor_price || 0
    const er = q.exchange_rate || 1
    const duty = q.duty_pct || 0
    const freight = q.freight_cost || 0
    const sc = q.surcharge || 0
    const mc = q.material_cost || 0
    const pm = q.pricing_method || 'FOB'
    const { landedExclCustoms, inboundCustoms, landedCost } = calcLanded(vp, er, duty, freight, sc, pm, mc)
    const calculatedRetail = q.target_margin_pct ? calcRetailPrice(landedCost, q.target_margin_pct) : 0
    const calculatedMargin = q.target_retail_price ? calcMargin(landedCost, q.target_retail_price) : 0
    return { landedExclCustoms, inboundCustoms, landedCost, calculatedRetail, calculatedMargin }
  }

  if (loading) {
    return <div className="text-neutral-500 text-sm py-8 text-center">Loading supplier quotes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Supplier Quotes</h2>
          <p className="text-xs text-neutral-500 mt-1">Price & margin calculation per supplier / volume tier</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + New Supplier Quote
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">
            {editingId ? 'Edit Supplier Quote' : 'New Supplier Quote'}
          </h3>

          {/* Row 1: Supplier, Colour, Volume, Pricing Method */}
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour</label>
              <select value={colourId} onChange={(e) => handleColourSelect(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                {colours.map((c) => (
                  <option key={c.id} value={c.id}>{c.colour_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Vol From *</label>
              <input type="number" value={volumeFrom} onChange={(e) => setVolumeFrom(e.target.value)} className={inputClass} placeholder="100" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Vol To</label>
              <input type="number" value={volumeTo} onChange={(e) => setVolumeTo(e.target.value)} className={inputClass} placeholder="500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">FOB / CMT</label>
              <select value={pricingMethod} onChange={(e) => setPricingMethod(e.target.value)} className={inputClass}>
                <option value="FOB">FOB</option>
                <option value="CMT">CMT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Shipping Country</label>
              <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {SHIPPING_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Vendor price, Material cost (CMT), Currency, Exchange rate */}
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Vendor Price</label>
              <input type="number" step="0.01" value={vendorPrice} onChange={(e) => setVendorPrice(e.target.value)} className={inputClass} placeholder="0.00" />
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
            {pricingMethod === 'CMT' && (
              <>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Material Cost *</label>
                  <input type="number" step="0.01" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Material Currency</label>
                  <select value={materialCostCurrency} onChange={(e) => setMaterialCostCurrency(e.target.value)} className={inputClass}>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-neutral-500 mb-1">FX Rate (→EUR)</label>
              <input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Row 3: Duty, Freight, Surcharge → Calculated fields */}
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Duty %</label>
              <input type="number" step="0.1" value={dutyPct} onChange={(e) => setDutyPct(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Freight (EUR)</label>
              <input type="number" step="0.01" value={freightCost} onChange={(e) => setFreightCost(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Surcharge (EUR)</label>
              <input type="number" step="0.01" value={surcharge} onChange={(e) => setSurcharge(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Landed excl. C&S</label>
              <div className={readOnlyClass}>
                {liveCalc.landedExclCustoms > 0 ? `€${liveCalc.landedExclCustoms.toFixed(2)}` : '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Customs & Shipping</label>
              <div className={readOnlyClass}>
                {liveCalc.inboundCustoms > 0 ? `€${liveCalc.inboundCustoms.toFixed(2)}` : '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Landed Cost (EUR)</label>
              <div className={`${readOnlyClass} font-medium`}>
                {liveCalc.landedCost > 0 ? `€${liveCalc.landedCost.toFixed(2)}` : '—'}
              </div>
            </div>
          </div>

          {/* Row 4: Margin & Retail */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Target Margin %</label>
              <input type="number" step="0.1" value={targetMarginPct} onChange={(e) => setTargetMarginPct(e.target.value)} className={inputClass} placeholder="e.g. 60" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Calc. Retail Price (EUR)</label>
              <div className={readOnlyClass}>
                {liveCalc.calculatedRetail > 0 ? `€${liveCalc.calculatedRetail.toFixed(2)}` : '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Target Retail Price (EUR)</label>
              <input type="number" step="0.01" value={targetRetailPrice} onChange={(e) => setTargetRetailPrice(e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Calc. Margin</label>
              <div className={`${readOnlyClass} ${liveCalc.calculatedMargin > 0 && liveCalc.calculatedMargin < (parseFloat(targetMarginPct) || 0) ? 'text-yellow-400' : ''}`}>
                {liveCalc.calculatedMargin > 0 ? `${liveCalc.calculatedMargin.toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>

          {/* Row 5: Validity & Notes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Valid From</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Valid To</label>
              <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSave} className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition">
              {editingId ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Quotes Table ── */}
      {quotes.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          No supplier quotes for this product yet.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-3 py-2.5 font-medium">Supplier</th>
                <th className="text-left px-3 py-2.5 font-medium">Colour</th>
                <th className="text-left px-3 py-2.5 font-medium">Vol</th>
                <th className="text-left px-3 py-2.5 font-medium">FOB/CMT</th>
                <th className="text-right px-3 py-2.5 font-medium">Vendor Price</th>
                {quotes.some((q) => q.pricing_method === 'CMT') && (
                  <th className="text-right px-3 py-2.5 font-medium">Material</th>
                )}
                <th className="text-right px-3 py-2.5 font-medium">FX</th>
                <th className="text-right px-3 py-2.5 font-medium">Duty</th>
                <th className="text-right px-3 py-2.5 font-medium">Freight</th>
                <th className="text-right px-3 py-2.5 font-medium">Landed excl.</th>
                <th className="text-right px-3 py-2.5 font-medium">C&S</th>
                <th className="text-right px-3 py-2.5 font-medium">Landed</th>
                <th className="text-right px-3 py-2.5 font-medium">Margin %</th>
                <th className="text-right px-3 py-2.5 font-medium">Calc. Retail</th>
                <th className="text-right px-3 py-2.5 font-medium">Target Retail</th>
                <th className="text-right px-3 py-2.5 font-medium">Calc. Margin</th>
                <th className="text-right px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const qc = quoteCalc(q)
                const belowTarget = q.target_margin_pct && qc.calculatedMargin > 0 && qc.calculatedMargin < q.target_margin_pct
                const hasCmt = quotes.some((qq) => qq.pricing_method === 'CMT')

                return (
                  <tr key={q.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                    <td className="px-3 py-2.5 text-white text-xs">{q.suppliers?.name || '—'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {q.colours?.hex_value && (
                          <div className="w-3 h-3 rounded border border-neutral-700" style={{ backgroundColor: q.colours.hex_value }} />
                        )}
                        <span className="text-neutral-300 text-xs">{q.colours?.colour_name || q.colour_name || 'Any'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-300 text-xs">
                      {q.volume_from}{q.volume_to ? `–${q.volume_to}` : '+'}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-400 text-xs">{q.pricing_method || 'FOB'}</td>
                    <td className="px-3 py-2.5 text-right text-neutral-300 font-mono text-xs">
                      {q.vendor_price != null ? `${q.currency} ${q.vendor_price.toFixed(2)}` : '—'}
                    </td>
                    {hasCmt && (
                      <td className="px-3 py-2.5 text-right text-neutral-400 font-mono text-xs">
                        {q.material_cost != null ? `${q.material_cost_currency || q.currency} ${q.material_cost.toFixed(2)}` : '—'}
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-right text-neutral-500 font-mono text-xs">{q.exchange_rate ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-neutral-500 font-mono text-xs">{q.duty_pct != null ? `${q.duty_pct}%` : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-neutral-500 font-mono text-xs">{q.freight_cost != null ? `€${q.freight_cost.toFixed(2)}` : '—'}</td>
                    <td className="px-3 py-2.5 text-right text-neutral-400 font-mono text-xs">
                      {qc.landedExclCustoms > 0 ? `€${qc.landedExclCustoms.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-neutral-500 font-mono text-xs">
                      {qc.inboundCustoms > 0 ? `€${qc.inboundCustoms.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white font-mono text-xs font-medium">
                      {qc.landedCost > 0 ? `€${qc.landedCost.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-neutral-400 text-xs">
                      {q.target_margin_pct != null ? `${q.target_margin_pct}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-neutral-300 font-mono text-xs">
                      {qc.calculatedRetail > 0 ? `€${qc.calculatedRetail.toFixed(0)}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white font-mono text-xs">
                      {q.target_retail_price != null ? `€${q.target_retail_price.toFixed(0)}` : '—'}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono text-xs font-medium ${belowTarget ? 'text-yellow-400' : 'text-neutral-300'}`}>
                      {qc.calculatedMargin > 0 ? `${qc.calculatedMargin.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <RowActions
                        onEdit={() => handleEdit(q)}
                        onDelete={() => handleDelete(q.id)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-neutral-600">
        {quotes.length} quote{quotes.length !== 1 ? 's' : ''} · Calc: Landed = (Vendor{' '}
        {quotes.some((q) => q.pricing_method === 'CMT') ? '+ Material ' : ''}
        × FX) × (1 + Duty%) + Freight + Surcharge · Retail = Landed / (1 − Margin%)
      </div>
    </div>
  )
}
