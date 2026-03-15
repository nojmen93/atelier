'use client'

import { useState } from 'react'

interface QuoteActionsProps {
  quoteId: string
  secretId: string
}

export default function QuoteActions({ quoteId: _quoteId, secretId }: QuoteActionsProps) {
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<'approved' | 'revision' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsSubmitting(true)
    setError(null)

    const res = await fetch('/api/quote/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretId, action: 'approved' }),
    })

    if (res.ok) {
      setSubmitted('approved')
      setShowApproveModal(false)
    } else {
      setError('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  const handleRevision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const message = formData.get('message') as string

    const res = await fetch('/api/quote/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretId, action: 'revision', message }),
    })

    if (res.ok) {
      setSubmitted('revision')
      setShowRevisionModal(false)
    } else {
      setError('Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <section className="quote-actions">
        <div className="quote-actions-success">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          {submitted === 'approved' ? (
            <>
              <h3>Quote Approved</h3>
              <p>Thank you! We&apos;ll be in touch shortly to collect the deposit and begin production.</p>
            </>
          ) : (
            <>
              <h3>Revision Requested</h3>
              <p>We&apos;ve received your feedback and will send an updated quote within 24 hours.</p>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="quote-actions">
        <h2 className="quote-section-title">Ready to proceed?</h2>
        <p className="quote-actions-subtitle">
          Approve this quote to move forward, or request changes if you need adjustments.
        </p>

        {error && <p style={{ color: '#e55', marginBottom: '1rem' }}>{error}</p>}

        <div className="quote-actions-buttons">
          <button
            className="quote-btn quote-btn--primary"
            onClick={() => setShowApproveModal(true)}
          >
            Approve Quote
          </button>
          <button
            className="quote-btn quote-btn--secondary"
            onClick={() => setShowRevisionModal(true)}
          >
            Request Changes
          </button>
        </div>
      </section>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="quote-modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="quote-modal-close"
              onClick={() => setShowApproveModal(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3>Confirm Approval</h3>
            <p>By approving this quote, you agree to the terms and conditions outlined above. We&apos;ll contact you to arrange the 50% deposit and begin production.</p>

            <div className="quote-modal-actions">
              <button
                className="quote-btn quote-btn--primary"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Approval'}
              </button>
              <button
                className="quote-btn quote-btn--ghost"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="quote-modal-overlay" onClick={() => setShowRevisionModal(false)}>
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="quote-modal-close"
              onClick={() => setShowRevisionModal(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3>Request Changes</h3>
            <p>Let us know what you&apos;d like adjusted and we&apos;ll send a revised quote.</p>

            <form onSubmit={handleRevision}>
              <textarea
                name="message"
                placeholder="Describe the changes you need..."
                rows={4}
                required
                className="quote-modal-textarea"
              />

              <div className="quote-modal-actions">
                <button
                  type="submit"
                  className="quote-btn quote-btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  className="quote-btn quote-btn--ghost"
                  onClick={() => setShowRevisionModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
