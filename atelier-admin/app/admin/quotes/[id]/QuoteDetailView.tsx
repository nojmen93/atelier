'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardSave } from '@/lib/useKeyboardSave'
import Link from 'next/link'
import CreateFromQuoteModal from './CreateFromQuoteModal'
import EmailQuoteModal from './EmailQuoteModal'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted to Order' },
]

const STATUS_BADGES: Record<string, string> = {
  new: 'border-blue-700 bg-blue-900/50 text-blue-100',
  reviewed: 'border-yellow-700 bg-yellow-900/50 text-yellow-100',
  quoted: 'border-purple-700 bg-purple-900/50 text-purple-100',
  accepted: 'border-green-700 bg-green-900/50 text-green-100',
  rejected: 'border-red-700 bg-red-900/50 text-red-100',
  converted: 'border-emerald-700 bg-emerald-900/50 text-emerald-100',
}

const PLACEMENT_LABELS: Record<string, string> = {
  center_front: 'Center Front',
  center_back: 'Center Back',
  hsp: 'From HSP',
  wrs: 'Center on WRS',
  wls: 'Center on WLS',
}

const TECHNIQUE_LABELS: Record<string, string> = {
  embroidery: 'Embroidery',
  print: 'Print',
}

interface QuoteStyle {
  id: string
  name: string
  images: string[] | null
  base_cost: number | null
  lead_time_days: number | null
  material: string | null
  description: string | null
}

interface Quote {
  id: string
  customer_name: string
  customer_email: string
  customer_company: string | null
  customer_phone: string | null
  style_id: string | null
  product_name: string | null
  customization_preferences: Record<string, string>
  logo_file_url: string | null
  quantity: number
  variant_preferences: Array<{ size: string | null; color: string | null; quantity: number | null }>
  message: string | null
  status: string
  quoted_price: number | null
  customization_fee: number | null
  quoted_at: string | null
  internal_notes: string | null
  converted_style_id: string | null
  converted_at: string | null
  created_at: string
  styles: QuoteStyle | null
}

interface Concept { id: string; name: string; categories: { id: string; name: string }[] }
interface Supplier { id: string; name: string }
interface Logo { id: string; company_name: string; file_url: string; file_format: string }

export default function QuoteDetailView({
  quote,
  styles,
  concepts,
  suppliers,
  logos,
}: {
  quote: Quote
  styles: { id: string; name: string }[]
  concepts: Concept[]
  suppliers: Supplier[]
  logos: Logo[]
}) {
  const [status, setStatus] = useState(quote.status)
  const [baseCost, setBaseCost] = useState(quote.styles?.base_cost?.toString() || '')
  const [customizationFee, setCustomizationFee] = useState(quote.customization_fee?.toString() || '0')
  const [margin, setMargin] = useState('30')
  const [quotedPrice, setQuotedPrice] = useState(quote.quoted_price?.toString() || '')
  const [internalNotes, setInternalNotes] = useState(quote.internal_notes || '')
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Price calculator
  const unitCost = parseFloat(baseCost) || 0
  const custFee = parseFloat(customizationFee) || 0
  const marginPct = parseFloat(margin) || 0
  const subtotal = (unitCost + custFee) * quote.quantity
  const calculatedTotal = subtotal * (1 + marginPct / 100)

  const applyCalculated = () => {
    setQuotedPrice(calculatedTotal.toFixed(2))
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)

    const updates: Record<string, unknown> = {
      status,
      quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
      customization_fee: customizationFee ? parseFloat(customizationFee) : null,
      internal_notes: internalNotes || null,
    }

    // Set quoted_at when status changes to 'quoted' and there's a price
    if (status === 'quoted' && quotedPrice && !quote.quoted_at) {
      updates.quoted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('quote_requests')
      .update(updates)
      .eq('id', quote.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Quote updated')
      router.refresh()
    }

    setSaving(false)
  }

  useKeyboardSave(useCallback(() => { handleSave() }, [status, quotedPrice, customizationFee, internalNotes]))

  const statusColor = STATUS_BADGES[status] || 'border-neutral-700 bg-neutral-800 text-neutral-300'
  const custPrefs = quote.customization_preferences || {}
  const variantPrefs = quote.variant_preferences || []

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quote Request</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Submitted {new Date(quote.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`px-4 py-2 text-sm font-medium rounded border transition ${statusColor}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Converted banner */}
      {quote.converted_style_id && (
        <div className="mb-6 px-4 py-3 bg-emerald-900/30 border border-emerald-800 rounded-lg flex items-center justify-between">
          <span className="text-sm text-emerald-200">This quote has been converted to a style.</span>
          <Link href={`/admin/styles/${quote.converted_style_id}`} className="text-sm text-emerald-300 hover:text-white underline transition">
            View Style &rarr;
          </Link>
        </div>
      )}

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Customer Info */}
        <div className="space-y-6">
          <div className="border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <div className="text-lg font-semibold">{quote.customer_name}</div>
                <a href={`mailto:${quote.customer_email}`} className="text-sm text-blue-400 hover:text-blue-300 transition">{quote.customer_email}</a>
              </div>
              {quote.customer_company && (
                <div>
                  <div className="text-xs text-neutral-500">Company</div>
                  <div className="text-sm">{quote.customer_company}</div>
                </div>
              )}
              {quote.customer_phone && (
                <div>
                  <div className="text-xs text-neutral-500">Phone</div>
                  <div className="text-sm">{quote.customer_phone}</div>
                </div>
              )}
            </div>
          </div>

          {quote.message && (
            <div className="border border-neutral-800 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Message</h2>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{quote.message}</p>
            </div>
          )}

          {/* Variant Breakdown */}
          {variantPrefs.length > 0 && (
            <div className="border border-neutral-800 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Variant Breakdown</h2>
              <div className="space-y-1.5">
                {variantPrefs.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-300">
                      {[v.size, v.color].filter(Boolean).join(' / ') || 'Unspecified'}
                    </span>
                    {v.quantity && <span className="text-neutral-400 tabular-nums">&times;{v.quantity}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE — Product & Customization Preview */}
        <div className="space-y-6">
          <div className="border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">Product</h2>

            {/* Linked style info */}
            {quote.styles ? (
              <div>
                <Link href={`/admin/styles/${quote.style_id}`} className="text-lg font-semibold text-white hover:text-blue-400 transition">
                  {quote.styles.name}
                </Link>
                {quote.styles.images && quote.styles.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {quote.styles.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded bg-neutral-800" />
                    ))}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {quote.styles.base_cost && (
                    <div>
                      <span className="text-neutral-500">Base Cost</span>
                      <div className="text-neutral-200">&euro;{Number(quote.styles.base_cost).toFixed(2)}</div>
                    </div>
                  )}
                  {quote.styles.lead_time_days && (
                    <div>
                      <span className="text-neutral-500">Lead Time</span>
                      <div className="text-neutral-200">{quote.styles.lead_time_days} days</div>
                    </div>
                  )}
                  {quote.styles.material && (
                    <div className="col-span-2">
                      <span className="text-neutral-500">Material</span>
                      <div className="text-neutral-200">{quote.styles.material}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-semibold">{quote.product_name || 'No product specified'}</div>
                <p className="text-xs text-neutral-500 mt-1">Not linked to an existing style</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-sm">Quantity</span>
                <span className="text-xl font-bold tabular-nums">{quote.quantity}</span>
              </div>
            </div>
          </div>

          {/* Customization Preferences */}
          {Object.keys(custPrefs).length > 0 && (
            <div className="border border-neutral-800 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Customization Preferences</h2>
              <div className="space-y-2 text-sm">
                {custPrefs.placement && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Placement</span>
                    <span>{PLACEMENT_LABELS[custPrefs.placement] || custPrefs.placement}</span>
                  </div>
                )}
                {custPrefs.technique && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Technique</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${custPrefs.technique === 'embroidery' ? 'bg-blue-900/50 text-blue-200' : 'bg-purple-900/50 text-purple-200'}`}>
                      {TECHNIQUE_LABELS[custPrefs.technique] || custPrefs.technique}
                    </span>
                  </div>
                )}
                {custPrefs.pantone_color && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pantone Color</span>
                    <span>{custPrefs.pantone_color}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logo preview */}
          {quote.logo_file_url && (
            <div className="border border-neutral-800 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Customer Logo</h2>
              <img src={quote.logo_file_url} alt="Customer logo" className="max-w-full max-h-32 object-contain bg-neutral-900 rounded p-4" />
            </div>
          )}
        </div>

        {/* RIGHT — Quote Response + Actions */}
        <div className="space-y-6">
          {/* Price Calculator */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">Price Calculator</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Unit Base Cost (&euro;)</label>
                <input
                  type="number"
                  step="0.01"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Customization Fee (&euro;/unit)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customizationFee}
                  onChange={(e) => setCustomizationFee(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Margin (%)</label>
                <input
                  type="number"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
                />
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Unit cost + customization</span>
                  <span className="tabular-nums">&euro;{(unitCost + custFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>&times; {quote.quantity} units</span>
                  <span className="tabular-nums">&euro;{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>+ {marginPct}% margin</span>
                  <span className="tabular-nums">&euro;{(subtotal * marginPct / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-white pt-2 border-t border-neutral-700">
                  <span>Calculated Total</span>
                  <span className="tabular-nums">&euro;{calculatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={applyCalculated}
                className="w-full py-2 text-sm text-neutral-300 border border-neutral-700 rounded hover:bg-neutral-800 transition"
              >
                Apply as Quoted Price
              </button>
            </div>
          </div>

          {/* Quote Response */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">Quote Response</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Quoted Price (&euro;)</label>
                <input
                  type="number"
                  step="0.01"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none font-semibold"
                  placeholder="Total price to quote"
                />
              </div>
              {quote.quoted_at && (
                <p className="text-xs text-neutral-500">
                  Quoted on {new Date(quote.quoted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-3">Internal Notes</h2>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
              placeholder="Notes visible only to admin..."
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              disabled={!quotedPrice}
              className="w-full py-3 text-sm font-medium border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send Quote Email
            </button>

            {!quote.converted_style_id && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full py-3 text-sm font-medium border border-emerald-800 text-emerald-300 rounded hover:bg-emerald-900/30 transition"
              >
                Create Style from Quote
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateFromQuoteModal
          quote={quote}
          concepts={concepts}
          suppliers={suppliers}
          logos={logos}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            setStatus('converted')
            router.refresh()
          }}
        />
      )}

      {showEmailModal && (
        <EmailQuoteModal
          quote={quote}
          quotedPrice={quotedPrice}
          onClose={() => setShowEmailModal(false)}
          onSent={async () => {
            setShowEmailModal(false)
            if (status === 'reviewed' || status === 'new') {
              setStatus('quoted')
              await supabase
                .from('quote_requests')
                .update({ status: 'quoted', quoted_at: new Date().toISOString() })
                .eq('id', quote.id)
              router.refresh()
            }
          }}
        />
      )}
    </>
  )
}
