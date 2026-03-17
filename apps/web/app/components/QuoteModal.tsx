'use client'

import { useState, useEffect } from 'react'
import { type ProductColour } from './ProductCard'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

interface Props {
  open: boolean
  onClose: () => void
  prefill?: string
  selectedColour?: ProductColour | null
  availableSizes?: string[]
}

interface FormState {
  name: string
  email: string
  company: string
  message: string
}

const empty: FormState = { name: '', email: '', company: '', message: '' }

export default function QuoteModal({
  open,
  onClose,
  prefill = '',
  selectedColour = null,
  availableSizes = [],
}: Props) {
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setSelectedSizes([])
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => { setStatus('idle'); setErrors({}) }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    if (!form.message.trim()) errs.message = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('submitting')
    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          message: form.message,
          productInterest: prefill,
          phone: '',
          selectedColour: selectedColour?.colour_name ?? null,
          selectedSizes: selectedSizes.length > 0 ? selectedSizes : null,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  // sizes to show: use product's available sizes if provided, else fall back to common sizes
  const sizesToShow = availableSizes.length > 0 ? availableSizes : ALL_SIZES

  if (!open) return null

  return (
    <div className="qmodal-overlay" onClick={onClose} style={{ pointerEvents: 'auto' }}>
      <div className="qmodal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="qmodal-close" onClick={onClose} aria-label="Close" style={{ pointerEvents: 'auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="qmodal-success">
            <div className="qmodal-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3>Request Received</h3>
            <p>We&apos;ll be in touch within 24 hours with your custom quote.</p>
          </div>
        ) : (
          <>
            <h2 className="qmodal-title">Get a Quote</h2>

            {/* Product + Colour summary */}
            {prefill && (
              <div className="qmodal-product-info">
                <div className="qmodal-product-row">
                  <span className="qmodal-product-label">Product</span>
                  <span className="qmodal-product-value">{prefill}</span>
                </div>
                {selectedColour && (
                  <div className="qmodal-product-row">
                    <span className="qmodal-product-label">Colour</span>
                    <span className="qmodal-product-value qmodal-colour-row">
                      <span
                        className="qmodal-colour-dot"
                        style={{ background: selectedColour.hex_value || '#888' }}
                      />
                      {selectedColour.colour_name}
                    </span>
                  </div>
                )}
              </div>
            )}

            {!prefill && (
              <p className="qmodal-sub">Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
            )}

            <form className="qmodal-form" onSubmit={submit} noValidate>
              <div className="qmodal-field">
                <label className="qmodal-label" htmlFor="qm-name">Name *</label>
                <input
                  id="qm-name"
                  className="qmodal-input"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Jane Smith"
                  autoComplete="name"
                />
                {errors.name && <span className="qmodal-error">{errors.name}</span>}
              </div>

              <div className="qmodal-field">
                <label className="qmodal-label" htmlFor="qm-email">Email *</label>
                <input
                  id="qm-email"
                  className="qmodal-input"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="jane@company.com"
                  autoComplete="email"
                />
                {errors.email && <span className="qmodal-error">{errors.email}</span>}
              </div>

              <div className="qmodal-field">
                <label className="qmodal-label" htmlFor="qm-company">Company</label>
                <input
                  id="qm-company"
                  className="qmodal-input"
                  type="text"
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                />
              </div>

              {/* Size selection */}
              <div className="qmodal-field">
                <label className="qmodal-label">Sizes Needed</label>
                <div className="qmodal-sizes">
                  {sizesToShow.map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`qmodal-size-chip${selectedSizes.includes(size) ? ' selected' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="qmodal-field">
                <label className="qmodal-label" htmlFor="qm-message">Message *</label>
                <textarea
                  id="qm-message"
                  className="qmodal-textarea"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Describe your project — quantities, timeline, customization..."
                  rows={4}
                />
                {errors.message && <span className="qmodal-error">{errors.message}</span>}
              </div>

              {status === 'error' && (
                <p className="qmodal-error">Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                className="btn btn--primary qmodal-submit"
                disabled={status === 'submitting'}
                style={{ pointerEvents: 'auto' }}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
