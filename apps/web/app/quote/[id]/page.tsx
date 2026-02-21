import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getQuoteBySecretId, urlFor, type Quote } from '@/lib/sanity'
import QuoteActions from './QuoteActions'
import QuoteGallery from './QuoteGallery'

// Demo quote for when Sanity isn't connected
const demoQuote: Quote = {
  _id: 'demo',
  clientName: 'Acme Corporation',
  clientEmail: 'hello@acme.com',
  secretId: 'demo',
  status: 'sent',
  introMessage: 'Thank you for your interest in working with us. We\'ve put together a custom proposal for your branded apparel based on our conversation.',
  products: [
    {
      _key: '1',
      name: 'Premium Embroidered Cap',
      description: '6-panel structured cap with premium embroidery on front panel. Adjustable strap with metal buckle.',
      mockupImages: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'] as unknown as Quote['products'][0]['mockupImages'],
      decorationType: 'embroidery',
      colors: ['Black', 'Navy', 'Stone'],
      sizes: 'One Size',
      quantity: 100,
      unitPrice: 18.50,
    },
    {
      _key: '2',
      name: 'Heavyweight Crew Sweatshirt',
      description: '400gsm organic cotton french terry. Relaxed fit with ribbed cuffs and hem. Embroidered chest logo.',
      mockupImages: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'] as unknown as Quote['products'][0]['mockupImages'],
      decorationType: 'embroidery',
      colors: ['Black', 'Off-White'],
      sizes: 'XS - 3XL',
      quantity: 75,
      unitPrice: 42.00,
    },
    {
      _key: '3',
      name: 'Classic Logo Tee',
      description: '220gsm ringspun cotton. Regular fit. Screen printed front and back.',
      mockupImages: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'] as unknown as Quote['products'][0]['mockupImages'],
      decorationType: 'screenprint',
      colors: ['Black', 'White', 'Forest Green'],
      sizes: 'XS - 3XL',
      quantity: 200,
      unitPrice: 14.00,
    },
  ],
  deliveryTimeline: '2-3 weeks after approval',
  validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  terms: `• 50% deposit required to begin production
• Balance due before shipping
• Delivery timeline begins after design approval
• All sales are final for custom branded products
• Prices exclude VAT (25%)`,
  createdAt: new Date().toISOString(),
}

function getImageUrl(image: unknown): string {
  if (typeof image === 'string') {
    return image
  }
  return urlFor(image as Parameters<typeof urlFor>[0]).width(800).quality(85).url()
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
  
  let quote: Quote | null = null

  // Use demo quote for demo ID
  if (id === 'demo') {
    quote = demoQuote
  } else {
    try {
      quote = await getQuoteBySecretId(id)
    } catch {
      // Sanity not configured
    }
  }

  if (!quote) {
    notFound()
  }

  // Check if expired
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()
  
  // Calculate totals
  const subtotal = quote.products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0)
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
            <strong>{quote.clientName}</strong>
          </div>
        </div>
      </header>

      <main className="quote-main">
        <div className="quote-container">
          {/* Status Banner */}
          {isExpired && (
            <div className="quote-banner quote-banner--expired">
              This quote expired on {formatDate(quote.validUntil!)}. Please contact us for an updated proposal.
            </div>
          )}
          
          {quote.status === 'approved' && (
            <div className="quote-banner quote-banner--approved">
              This quote has been approved. We&apos;ll be in touch shortly to begin production.
            </div>
          )}

          {/* Intro */}
          <section className="quote-intro">
            {quote.clientLogo && (
              <div className="quote-client-logo">
                <Image
                  src={getImageUrl(quote.clientLogo)}
                  alt={quote.clientName}
                  width={120}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <h1 className="quote-title">Your Custom Apparel Proposal</h1>
            {quote.introMessage && (
              <p className="quote-intro-text">{quote.introMessage}</p>
            )}
            <div className="quote-details">
              <div className="quote-detail">
                <span className="quote-detail-label">Quote Date</span>
                <span className="quote-detail-value">{formatDate(quote.createdAt)}</span>
              </div>
              {quote.validUntil && (
                <div className="quote-detail">
                  <span className="quote-detail-label">Valid Until</span>
                  <span className="quote-detail-value">{formatDate(quote.validUntil)}</span>
                </div>
              )}
              {quote.deliveryTimeline && (
                <div className="quote-detail">
                  <span className="quote-detail-label">Delivery</span>
                  <span className="quote-detail-value">{quote.deliveryTimeline}</span>
                </div>
              )}
            </div>
          </section>

          {/* Products */}
          <section className="quote-products">
            <h2 className="quote-section-title">Proposed Items</h2>
            
            <div className="quote-products-list">
              {quote.products.map((product, index) => (
                <div key={product._key} className="quote-product">
                  <div className="quote-product-number">{String(index + 1).padStart(2, '0')}</div>
                  
                  <div className="quote-product-gallery">
                    <QuoteGallery 
                      images={product.mockupImages.map(img => getImageUrl(img))}
                      productName={product.name}
                    />
                  </div>
                  
                  <div className="quote-product-info">
                    <h3 className="quote-product-name">{product.name}</h3>
                    {product.description && (
                      <p className="quote-product-desc">{product.description}</p>
                    )}
                    
                    <div className="quote-product-specs">
                      {product.decorationType && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Method</span>
                          <span className="spec-value">{getDecorationLabel(product.decorationType)}</span>
                        </div>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Colors</span>
                          <span className="spec-value">{product.colors.join(', ')}</span>
                        </div>
                      )}
                      {product.sizes && (
                        <div className="quote-product-spec">
                          <span className="spec-label">Sizes</span>
                          <span className="spec-value">{product.sizes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="quote-product-pricing">
                    <div className="quote-price-row">
                      <span>Unit Price</span>
                      <span>€{product.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="quote-price-row">
                      <span>Quantity</span>
                      <span>{product.quantity}</span>
                    </div>
                    <div className="quote-price-row quote-price-total">
                      <span>Subtotal</span>
                      <span>€{(product.quantity * product.unitPrice).toFixed(2)}</span>
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
                  <span>Subtotal ({quote.products.length} items)</span>
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
            <QuoteActions quoteId={quote._id} secretId={quote.secretId} />
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
