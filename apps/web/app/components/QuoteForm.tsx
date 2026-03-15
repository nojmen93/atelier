'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
}

interface FormState {
  name: string
  email: string
  company: string
  phone: string
  productInterest: string
  quantity: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  company: '',
  phone: '',
  productInterest: '',
  quantity: '',
  message: '',
}

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products/public')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<string>).detail
      setForm((prev) => ({ ...prev, productInterest: name }))
    }
    window.addEventListener('productinterest', handler)
    return () => window.removeEventListener('productinterest', handler)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    const res = await fetch('/api/quote-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setStatus('success')
      setForm(initialState)
    } else {
      setStatus('error')
    }
  }

  return (
    <section className="quote-form-section section" id="quote">
      <div className="container">
        <div className="quote-form-grid">

          {/* Left — copy */}
          <div className="quote-form-copy">
            <p className="label">Get Started</p>
            <h2 className="headline-lg quote-form-title">Let&apos;s Build<br />Something</h2>
            <p className="quote-form-sub">
              Tell us what you need and we&apos;ll get back to you within 24 hours
              with a detailed proposal and pricing.
            </p>

            <ul className="quote-form-promises">
              <li>
                <span className="promise-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                Response within 24 hours
              </li>
              <li>
                <span className="promise-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                No obligation quote
              </li>
              <li>
                <span className="promise-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                Free mockup with every quote
              </li>
            </ul>
          </div>

          {/* Right — form */}
          <div className="quote-form-wrap">
            {status === 'success' ? (
              <div className="quote-form-success">
                <div className="success-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3>Request Received</h3>
                <p>We&apos;ll be in touch within 24 hours with your custom quote.</p>
                <button className="btn btn--ghost" onClick={() => setStatus('idle')}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form className="quote-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Full Name <span className="required">*</span></label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input
                      id="email"
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

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      autoComplete="organization"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 555 000 0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="product-interest">Product Interest</label>
                    <select
                      id="product-interest"
                      name="productInterest"
                      value={form.productInterest}
                      onChange={handleChange}
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="quantity">Estimated Quantity</label>
                    <select
                      id="quantity"
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
                </div>

                <div className="form-field">
                  <label htmlFor="message">Tell Us More <span className="required">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your project — garment types, colors, decoration, timeline, any specific requirements..."
                    rows={5}
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className="form-error">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary form-submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Quote Request'}
                  {status !== 'submitting' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
