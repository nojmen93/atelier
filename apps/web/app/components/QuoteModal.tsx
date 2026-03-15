'use client'

import { useState, useEffect } from 'react'

interface FormState {
  name: string
  email: string
  company: string
  productInterest: string
  quantity: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  company: '',
  productInterest: '',
  quantity: '',
  message: '',
}

interface Props {
  open: boolean
  onClose: () => void
  prefill: string
}

export default function QuoteModal({ open, onClose, prefill }: Props) {
  const [form, setForm] = useState<FormState>({ ...initialState, productInterest: prefill })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    setForm((prev) => ({ ...prev, productInterest: prefill }))
  }, [prefill])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setTimeout(() => setStatus('idle'), 300)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: '' }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`qmodal-overlay${open ? ' open' : ''}`} onClick={onClose} aria-hidden={!open}>
      <div
        className={`qmodal${open ? ' open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Request a Quote"
      >
        <div className="qmodal-header">
          <div>
            <p className="qmodal-eyebrow">Get Started</p>
            <h2 className="qmodal-title">Request a Quote</h2>
          </div>
          <button className="qmodal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="qmodal-success">
            <div className="qmodal-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3>Request Received</h3>
            <p>We&apos;ll be in touch within 24 hours with your custom quote.</p>
            <button
              className="qmodal-done-btn"
              onClick={() => {
                setForm({ ...initialState, productInterest: prefill })
                onClose()
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="qmodal-form" onSubmit={handleSubmit} noValidate>
            <div className="qmodal-row">
              <div className="qmodal-field">
                <label htmlFor="qm-name">
                  Name <span className="qmodal-required">*</span>
                </label>
                <input
                  id="qm-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="qmodal-field">
                <label htmlFor="qm-email">
                  Email <span className="qmodal-required">*</span>
                </label>
                <input
                  id="qm-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="qmodal-row">
              <div className="qmodal-field">
                <label htmlFor="qm-company">Company</label>
                <input
                  id="qm-company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                />
              </div>
              <div className="qmodal-field">
                <label htmlFor="qm-product">Product</label>
                <input
                  id="qm-product"
                  name="productInterest"
                  type="text"
                  value={form.productInterest}
                  onChange={handleChange}
                  placeholder="e.g. T-Shirt (Black)"
                />
              </div>
            </div>

            <div className="qmodal-field">
              <label htmlFor="qm-quantity">Estimated Quantity</label>
              <select
                id="qm-quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              >
                <option value="">Select range</option>
                <option value="25-49">25 – 49 units</option>
                <option value="50-99">50 – 99 units</option>
                <option value="100-249">100 – 249 units</option>
                <option value="250-499">250 – 499 units</option>
                <option value="500+">500+ units</option>
              </select>
            </div>

            <div className="qmodal-field">
              <label htmlFor="qm-message">
                Message <span className="qmodal-required">*</span>
              </label>
              <textarea
                id="qm-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project — garments, quantities, timeline, decoration style..."
                rows={4}
                required
              />
            </div>

            {status === 'error' && (
              <p className="qmodal-error">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              className="qmodal-submit"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Quote Request'}
              {status !== 'submitting' && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>

            <p className="qmodal-promise">
              Response within 24 hours · Free mockup included · No obligation
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
