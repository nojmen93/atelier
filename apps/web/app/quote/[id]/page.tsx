import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { getQuoteBySecretId, type ClientQuote } from '@/lib/supabase'
import QuoteActions from './QuoteActions'
import QuoteGallery from './QuoteGallery'

// Demo quote for local development / testing without a real Supabase record
const demoQuote: ClientQuote = {
  id: 'demo',
  secret_id: 'demo',
  client_name: 'Acme Corporation',
  client_email: 'hello@acme.com',
  status: 'sent',
  intro_message: "Thank you for your interest in working with us. We've put together a custom proposal for your branded apparel based on our conversation.",
  items: [
    {
      id: '1',
      quote_id: 'demo',
      name: 'Premium Embroidered Cap',
      description: '6-panel structured cap with premium embroidery on front panel. Adjustable strap with metal buckle.',
      mockup_image_urls: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'],
      decoration_type: 'embroidery',
      colors: ['Black', 'Navy', 'Stone'],
      sizes: 'One Size',
      quantity: 100,
      unit_price: 18.50,
      sort_order: 0,
    },
    {
      id: '2',
      quote_id: 'demo',
      name: 'Heavyweight Crew Sweatshirt',
      description: '400gsm organic cotton french terry. Relaxed fit with ribbed cuffs and hem. Embroidered chest logo.',
      mockup_image_urls: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
      decoration_type: 'embroidery',
      colors: ['Black', 'Off-White'],
      sizes: 'XS - 3XL',
      quantity: 75,
      unit_price: 42.00,
      sort_order: 1,
    },
    {
      id: '3',
      quote_id: 'demo',
      name: 'Classic Logo Tee',
      description: '220gsm ringspun cotton. Regular fit. Screen printed front and back.',
      mockup_image_urls: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      decoration_type: 'screenprint',
      colors: ['Black', 'White', 'Forest Green'],
      sizes: 'XS - 3XL',
      quantity: 200,
      unit_price: 14.00,
      sort_order: 2,
    },
  ],
  delivery_timeline: '2-3 weeks after approval',
  valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  terms: `• 50% deposit required to begin production
• Balance due before shipping
• Delivery timeline begins after design approval
• All sales are final for custom branded products
• Prices exclude VAT (25%)`,
  created_at: new Date().toISOString(),
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDecorationLabel(type?: string): string {
  const labels: Record<string, string> = {
    embroidery: 'Embroidery',
    screenprint: 'Screen Print',
    dtg: 'DTG Print',
    heattransfer: 'Heat Transfer',
  }
  return type ? labels[type] || type : ''
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params

  let quote: ClientQuote | null = null

  if (id === 'demo') {
    quote = demoQuote
  } else {
    quote = await getQuoteBySecretId(id)

    // Mark as viewed if it was in 'sent' state
    if (quote && quote.status === 'sent') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase
        .from('client_quotes')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('id', quote.id)
      quote = { ...quote, status: 'viewed' }
    }
  }

  if (!quote) {
    notFound()
  }

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date()

  const subtotal = quote.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const vat = subtotal * 0.25
  const total = subtotal + vat

  return (
    <div className="quote-page">
      {/* Header */}
      <header className="quote-header">
        <div className="quote-container">
          <div className="quote-brand">ATELIER</div>
          <div className="quote-meta">
            <span>Proposal for</span>
            <strong>{quote.client_name}</strong>
          </div>
        </div>
      </header>

      <main className="quote-main">
        <div className="quote-container">
          {/* Status Banners */}
          {isExpired && (
            <div className="quote-banner quote-banner--expired">
              This quote expired on {formatDate(quote.valid_until!)}. Please contact us for an updated proposal.
            </div>
          )}

          {quote.status === 'approved' && (
            <div className="quote-banner quote-banner--approved">
              This quote has been approved. We&apos;ll be in touch shortly to begin production.
            </div>
          )}

          {/* Intro */}
          <section className="quote-intro">
            {quote.client_logo_url && (
              <div className="quote-client-logo">
                <Image
                  src={quote.client_logo_url}
                  alt={quote.client_name}
                  width={120}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <h1 className="quote-title">Your Custom Apparel Proposal</h1>
            {quote.intro_message && (
              <p className="quote-intro-text">{quote.intro_message}</p>
            )}
            <div className="quote-details">
              <div className="quote-detail">
                <span className="quote-detail-label">Quote Date</span>
                <span className="quote-detail-value">{formatDate(quote.created_at)}</span>
              </div>
              {quote.valid_until && (
                <div className="quote-detail">
                  <span className="quote-detail-label">Valid Until</span>
                  <span className="quote-detail-value">{formatDate(quote.valid_until)}</span>
                </div>
              )}
              {quote.delivery_timeline && (
                <div className="quote-detail">
                  <span className="quote-detail-label">Delivery</span>
                  <span className="quote-detail-value">{quote.delivery_timeline}</span>
                </div>
              )}
            </div>
          </section>

          {/* Products */}
          <section className="quote-products">
            <h2 className="quote-section-title">Proposed Items</h2>

            <div className="quote-products-list">
              {quote.items.map((item, index) => (
                <div key={item.id} className="quote-product">
                  <div className="quote-product-number">{String(index + 1).padStart(2, '0')}</div>

                  <div className="quote-product-gallery">
                    <QuoteGallery
                      images={item.mockup_image_urls}
                      productName={item.name}
                    />
                  </div>

                  <div className="quote-product-info">
                    <h3 className="quote-product-name">{item.name}</h3>
                    {item.description && (
                      <p className="quote-product-desc">{item.description}</p>
                    )}

                    <div className="quote-product-specs">
                      {item.decoration_type && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Method</span>
                          <span className="spec-value">{getDecorationLabel(item.decoration_type)}</span>
                        </div>
                      )}
                      {item.colors && item.colors.length > 0 && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Colors</span>
                          <span className="spec-value">{item.colors.join(', ')}</span>
                        </div>
                      )}
                      {item.sizes && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Sizes</span>
                          <span className="spec-value">{item.sizes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="quote-product-pricing">
                    <div className="quote-price-row">
                      <span>Unit Price</span>
                      <span>€{item.unit_price.toFixed(2)}</span>
                    </div>
                    <div className="quote-price-row">
                      <span>Quantity</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="quote-price-row quote-price-total">
                      <span>Subtotal</span>
                      <span>€{(item.quantity * item.unit_price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="quote-summary">
            <h2 className="quote-section-title">Order Summary</h2>

            <div className="quote-summary-grid">
              <div className="quote-summary-breakdown">
                <div className="quote-summary-row">
                  <span>Subtotal ({quote.items.length} items)</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="quote-summary-row">
                  <span>VAT (25%)</span>
                  <span>€{vat.toFixed(2)}</span>
                </div>
                <div className="quote-summary-row quote-summary-total">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              {quote.terms && (
                <div className="quote-terms">
                  <h4>Terms & Conditions</h4>
                  <pre>{quote.terms}</pre>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          {!isExpired && quote.status !== 'approved' && quote.status !== 'declined' && (
            <QuoteActions quoteId={quote.id} secretId={quote.secret_id} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="quote-footer">
        <div className="quote-container">
          <div className="quote-footer-brand">ATELIER</div>
          <p>Questions? Reply to this email or contact us at studio@atelier.com</p>
        </div>
      </footer>
    </div>
  )
}
