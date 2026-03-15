'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import BackLink from '@/components/BackLink'

interface Style {
  id: string
  name: string
}

interface VariantLine {
  size: string
  color: string
  quantity: string
}

export default function NewQuotePage() {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [styleId, setStyleId] = useState('')
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [message, setMessage] = useState('')
  const [placement, setPlacement] = useState('')
  const [technique, setTechnique] = useState('')
  const [pantoneColor, setPantoneColor] = useState('')
  const [variantLines, setVariantLines] = useState<VariantLine[]>([{ size: '', color: '', quantity: '' }])
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('styles')
      .select('id, name')
      .eq('active', true)
      .order('name')
      .then(({ data }) => { if (data) setStyles(data) })
  }, [supabase])

  const addVariantLine = () => {
    setVariantLines((prev) => [...prev, { size: '', color: '', quantity: '' }])
  }

  const updateVariantLine = (index: number, field: keyof VariantLine, value: string) => {
    setVariantLines((prev) => prev.map((line, i) => i === index ? { ...line, [field]: value } : line))
  }

  const removeVariantLine = (index: number) => {
    setVariantLines((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const customizationPreferences: Record<string, string> = {}
    if (placement) customizationPreferences.placement = placement
    if (technique) customizationPreferences.technique = technique
    if (pantoneColor) customizationPreferences.pantone_color = pantoneColor

    const variantPrefs = variantLines
      .filter((l) => l.size || l.color)
      .map((l) => ({
        size: l.size || null,
        color: l.color || null,
        quantity: l.quantity ? parseInt(l.quantity) : null,
      }))

    const { error } = await supabase.from('quote_requests').insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_company: customerCompany || null,
      customer_phone: customerPhone || null,
      style_id: styleId || null,
      product_name: productName || null,
      quantity: parseInt(quantity) || 1,
      message: message || null,
      customization_preferences: Object.keys(customizationPreferences).length > 0 ? customizationPreferences : {},
      variant_preferences: variantPrefs.length > 0 ? variantPrefs : [],
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Quote request created')
      router.push('/admin/quotes')
    }

    setLoading(false)
  }

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/quotes" label="Back to Quotes" />
      <h1 className="text-3xl font-bold mb-8">New Quote Request</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClass} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input type="text" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Product */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Existing Style (optional)</label>
              <select value={styleId} onChange={(e) => setStyleId(e.target.value)} className={inputClass}>
                <option value="">— Select existing style or leave blank —</option>
                {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <p className="text-xs text-neutral-500 mt-1">Link to an existing style, or describe the product below</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Product Description</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} placeholder="e.g. Custom polo shirt with embroidered logo" />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} min="1" required />
            </div>
          </div>
        </div>

        {/* Variant Breakdown */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Variant Breakdown (optional)</h2>
          <div className="space-y-2">
            {variantLines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={line.size} onChange={(e) => updateVariantLine(i, 'size', e.target.value)} placeholder="Size (e.g. M)" className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" />
                <input type="text" value={line.color} onChange={(e) => updateVariantLine(i, 'color', e.target.value)} placeholder="Color (e.g. Black)" className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" />
                <input type="number" value={line.quantity} onChange={(e) => updateVariantLine(i, 'quantity', e.target.value)} placeholder="Qty" className="w-20 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none" min="1" />
                {variantLines.length > 1 && (
                  <button type="button" onClick={() => removeVariantLine(i)} className="px-2 py-2 text-neutral-500 hover:text-red-400 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addVariantLine} className="text-sm text-neutral-400 hover:text-white transition">+ Add line</button>
          </div>
        </div>

        {/* Customization Preferences */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Customization Preferences (optional)</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Placement</label>
                <select value={placement} onChange={(e) => setPlacement(e.target.value)} className={inputClass}>
                  <option value="">—</option>
                  <option value="center_front">Center Front</option>
                  <option value="center_back">Center Back</option>
                  <option value="hsp">From HSP</option>
                  <option value="wrs">Center on WRS</option>
                  <option value="wls">Center on WLS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Technique</label>
                <select value={technique} onChange={(e) => setTechnique(e.target.value)} className={inputClass}>
                  <option value="">—</option>
                  <option value="embroidery">Embroidery</option>
                  <option value="print">Print</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pantone Color</label>
              <input type="text" value={pantoneColor} onChange={(e) => setPantoneColor(e.target.value)} className={inputClass} placeholder="e.g. Pantone 186 C" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Customer Message</h2>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputClass} placeholder="Any special requests or notes..." />
        </div>

        <button type="submit" disabled={loading} className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition">
          {loading ? 'Creating...' : 'Create Quote Request'}
        </button>
      </form>
    </div>
  )
}
