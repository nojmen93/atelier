'use client'

import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProductCard, { type Product } from '../components/ProductCard'
import QuoteModal from '../components/QuoteModal'

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [prefill, setPrefill] = useState('')

  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.json())
      .then((data: Product[]) => { if (Array.isArray(data)) setProducts(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openQuote = (name = '') => {
    setPrefill(name)
    setQuoteOpen(true)
  }

  const categories = Array.from(
    new Set(products.map(p => p.categories?.name).filter(Boolean) as string[])
  )

  const filtered = activeCategory
    ? products.filter(p => p.categories?.name === activeCategory)
    : products

  return (
    <div className="col-page">
      <Nav onOpenQuote={() => openQuote()} />

      <header className="col-header">
        <p className="col-eyebrow">Premium Custom Apparel</p>
        <h1 className="col-title">The Collection</h1>
        <p className="col-sub">
          Every piece is available for custom branding.
          Select a product and request a quote.
        </p>
      </header>

      {categories.length > 1 && (
        <div className="col-filters">
          <button
            className={`col-filter-btn${activeCategory === null ? ' active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`col-filter-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <span className="col-filter-count">{filtered.length} products</span>
        </div>
      )}

      <div className="col-grid-wrap">
        <div className="products-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pcard pcard-skeleton">
              <div className="pcard-img-wrap" />
              <div className="pcard-body">
                <div className="pcard-skeleton-line short" />
                <div className="pcard-skeleton-line medium" />
                <div className="pcard-skeleton-line short" />
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="products-empty">No products available yet.</p>
          )}

          {!loading && filtered.map(p => (
            <ProductCard key={p.id} product={p} onQuote={openQuote} />
          ))}
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="col-footer-cta">
          <p>Don&apos;t see what you&apos;re looking for?</p>
          <button className="btn btn--outline" onClick={() => openQuote()} type="button">
            Request a Custom Product
          </button>
        </div>
      )}

      <Footer />

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} prefill={prefill} />
    </div>
  )
}
