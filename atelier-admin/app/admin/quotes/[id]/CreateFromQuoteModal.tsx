'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useEscapeClose } from '@/lib/useKeyboardSave'

interface Quote {
  id: string
  customer_name: string
  customer_company: string | null
  product_name: string | null
  style_id: string | null
  quantity: number
  customization_preferences: Record<string, string>
  logo_file_url: string | null
  variant_preferences: Array<{ size: string | null; color: string | null; quantity: number | null }>
}

interface Concept { id: string; name: string; categories: { id: string; name: string }[] }
interface Supplier { id: string; name: string }
interface Logo { id: string; company_name: string; file_url: string; file_format: string }

function generateSku(styleName: string, size: string, color: string): string {
  const code = styleName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((w) => w.substring(0, 2).toUpperCase())
    .join('')
    .substring(0, 4)
  const s = size.toUpperCase().substring(0, 3)
  const c = color.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()
  return `${code}-${s}-${c}`
}

export default function CreateFromQuoteModal({
  quote,
  concepts,
  suppliers,
  logos,
  onClose,
  onCreated,
}: {
  quote: Quote
  concepts: Concept[]
  suppliers: Supplier[]
  logos: Logo[]
  onClose: () => void
  onCreated: () => void
}) {
  // Pre-fill product name from quote context
  const defaultName = quote.product_name
    || (quote.customer_company ? `${quote.customer_company} Custom` : '')
    || `Quote #${quote.id.substring(0, 8)}`

  const [styleName, setStyleName] = useState(defaultName)
  const [conceptId, setConceptId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [gender, setGender] = useState('unisex')
  const [baseCost, setBaseCost] = useState('')
  const [autoCreateVariants, setAutoCreateVariants] = useState(true)
  const [autoUploadLogo, setAutoUploadLogo] = useState(!!quote.logo_file_url)
  const [autoCreateCustomization, setAutoCreateCustomization] = useState(
    !!(quote.customization_preferences?.placement || quote.customization_preferences?.technique)
  )
  const [selectedLogoId, setSelectedLogoId] = useState('')
  const [creating, setCreating] = useState(false)

  useEscapeClose(onClose)
  const supabase = createClient()

  const selectedConcept = concepts.find((c) => c.id === conceptId)
  const categories = selectedConcept?.categories || []
  const variantPrefs = quote.variant_preferences || []
  const custPrefs = quote.customization_preferences || {}

  const handleConceptChange = (value: string) => {
    setConceptId(value)
    setCategoryId('')
  }

  const handleCreate = async () => {
    if (!conceptId || !categoryId) {
      toast.error('Please select a concept and category')
      return
    }
    if (!styleName.trim()) {
      toast.error('Please enter a style name')
      return
    }

    setCreating(true)

    try {
      // 1. Create the style
      const { data: newStyle, error: styleError } = await supabase
        .from('styles')
        .insert({
          name: styleName.trim(),
          concept_id: conceptId,
          category_id: categoryId,
          gender,
          collection_type: 'foundation',
          product_capability: 'simple_customizable',
          status: 'development',
          supplier_id: supplierId || null,
          base_cost: baseCost ? parseFloat(baseCost) : null,
          customization_mode: [custPrefs.technique, custPrefs.placement].filter(Boolean).join(', ') || null,
        })
        .select('id')
        .single()

      if (styleError) {
        toast.error(styleError.message)
        setCreating(false)
        return
      }

      const styleId = newStyle.id
      const results: string[] = []

      // 2. Create variants from breakdown
      if (autoCreateVariants && variantPrefs.length > 0) {
        const variantRows = variantPrefs
          .filter((v) => v.size || v.color)
          .map((v) => ({
            style_id: styleId,
            size: v.size || null,
            color: v.color || null,
            sku: (v.size && v.color) ? generateSku(styleName, v.size, v.color) : null,
            stock: v.quantity || 0,
            price_modifier: 0,
          }))

        if (variantRows.length > 0) {
          const { error: varError } = await supabase.from('variants').insert(variantRows)
          if (varError) {
            results.push(`Variants: failed (${varError.message})`)
          } else {
            results.push(`${variantRows.length} variant${variantRows.length !== 1 ? 's' : ''} created`)
          }
        }
      }

      // 3. Create customization entry
      if (autoCreateCustomization && (selectedLogoId || autoUploadLogo)) {
        const logoId = selectedLogoId || null

        if (logoId && custPrefs.placement) {
          const { error: custError } = await supabase.from('customizations').insert({
            style_id: styleId,
            logo_id: logoId,
            placement: custPrefs.placement || 'center_front',
            technique: custPrefs.technique || 'embroidery',
            pantone_color: custPrefs.pantone_color || null,
          })
          if (custError) {
            results.push(`Customization: failed (${custError.message})`)
          } else {
            results.push('Customization created')
          }
        }
      }

      // 4. Update quote with conversion reference
      await supabase
        .from('quote_requests')
        .update({
          converted_style_id: styleId,
          converted_at: new Date().toISOString(),
          status: 'converted',
        })
        .eq('id', quote.id)

      const summary = results.length > 0 ? ` (${results.join(', ')})` : ''
      toast.success(`Style created from quote${summary}`)
      onCreated()
    } catch {
      toast.error('Failed to create style from quote')
      setCreating(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-6">Create Style from Quote</h3>

        <div className="space-y-5">
          {/* Style Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Style Name</label>
            <input type="text" value={styleName} onChange={(e) => setStyleName(e.target.value)} className={inputClass} required />
          </div>

          {/* Concept / Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Concept</label>
              <select value={conceptId} onChange={(e) => handleConceptChange(e.target.value)} className={inputClass} required>
                <option value="">Select concept</option>
                {concepts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required disabled={!conceptId}>
                <option value="">{conceptId ? 'Select category' : 'Select concept first'}</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* Gender / Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                <option value="mens">Men&apos;s</option>
                <option value="womens">Women&apos;s</option>
                <option value="unisex">Unisex</option>
                <option value="na">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                <option value="">None</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Base Cost */}
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Base Cost (&euro;)</label>
            <input type="number" step="0.01" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} className={inputClass} />
          </div>

          {/* Auto-fill Options */}
          <div className="pt-4 border-t border-neutral-800">
            <h4 className="text-sm font-semibold text-neutral-400 mb-3">Auto-fill from Quote</h4>

            {/* Variants */}
            {variantPrefs.length > 0 && (
              <label className="flex items-start gap-3 mb-3 cursor-pointer">
                <input type="checkbox" checked={autoCreateVariants} onChange={(e) => setAutoCreateVariants(e.target.checked)} className="mt-0.5 accent-white" />
                <div>
                  <span className="text-sm font-medium">Create {variantPrefs.length} variant{variantPrefs.length !== 1 ? 's' : ''}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {variantPrefs.slice(0, 6).map((v, i) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-xs">
                        {[v.size, v.color].filter(Boolean).join(' / ')}{v.quantity ? ` ×${v.quantity}` : ''}
                      </span>
                    ))}
                    {variantPrefs.length > 6 && <span className="text-xs text-neutral-500">+{variantPrefs.length - 6} more</span>}
                  </div>
                </div>
              </label>
            )}

            {/* Logo */}
            {quote.logo_file_url && (
              <label className="flex items-start gap-3 mb-3 cursor-pointer">
                <input type="checkbox" checked={autoUploadLogo} onChange={(e) => setAutoUploadLogo(e.target.checked)} className="mt-0.5 accent-white" />
                <div>
                  <span className="text-sm font-medium">Use customer logo</span>
                  <p className="text-xs text-neutral-500">Will link to customization entry</p>
                </div>
              </label>
            )}

            {/* Customization */}
            {(custPrefs.placement || custPrefs.technique) && (
              <label className="flex items-start gap-3 mb-3 cursor-pointer">
                <input type="checkbox" checked={autoCreateCustomization} onChange={(e) => setAutoCreateCustomization(e.target.checked)} className="mt-0.5 accent-white" />
                <div>
                  <span className="text-sm font-medium">Create customization entry</span>
                  <div className="flex gap-2 mt-1">
                    {custPrefs.placement && <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-xs">{custPrefs.placement.replace(/_/g, ' ')}</span>}
                    {custPrefs.technique && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${custPrefs.technique === 'embroidery' ? 'bg-blue-900/50 text-blue-200' : 'bg-purple-900/50 text-purple-200'}`}>
                        {custPrefs.technique}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            )}

            {/* Logo selection for customization */}
            {autoCreateCustomization && (
              <div className="ml-7 mt-2">
                <label className="block text-xs text-neutral-500 mb-1">Link logo for customization</label>
                <select value={selectedLogoId} onChange={(e) => setSelectedLogoId(e.target.value)} className={inputClass}>
                  <option value="">— Select logo from library —</option>
                  {logos.map((l) => <option key={l.id} value={l.id}>{l.company_name} ({l.file_format})</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-800">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !conceptId || !categoryId}
            className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create & Link to Quote'}
          </button>
        </div>
      </div>
    </div>
  )
}
