'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ProductCard, { type Product } from './components/ProductCard'
import QuoteModal from './components/QuoteModal'
import { Boxes } from './components/ui/background-boxes'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [prefill, setPrefill] = useState('')

  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openQuote = (name = '') => {
    setPrefill(name)
    setQuoteOpen(true)
  }

  const featured = products.slice(0, 6)

  return (
    <div className="page-home">
      <Nav onOpenQuote={() => openQuote()} />

      {/* Hero */}
      <section className="home-hero">
        {/* Animated grid background */}
        <Boxes />
        {/* Radial fade overlay */}
        <div className="home-hero-overlay" />

        {/* Content */}
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <h1 className="home-hero-headline">
              Clothes That<br />Build Brands.
            </h1>
            <div className="home-hero-actions">
              <a href="/collection" className="btn btn--primary">Enter Collection</a>
              <button className="btn btn--outline" onClick={() => openQuote()} type="button">
                Get a Quote
              </button>
            </div>
          </div>

          <div className="home-hero-preview">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="hero-preview-img hero-preview-img--skeleton" />
                ))
              : featured.slice(0, 3).map((p, i) => {
                  const img = p.images?.[0] ?? null
                  return (
                    <div key={p.id} className={`hero-preview-img hero-preview-img--${i}`}>
                      {img ? (
                        <Image
                          src={img}
                          alt={p.display_name || p.name}
                          fill
                          className="hero-preview-img-inner"
                          sizes="200px"
                        />
                      ) : (
                        <div className="hero-preview-img-placeholder" />
                      )}
                    </div>
                  )
                })
            }
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="home-products">
        <div className="home-products-header">
          <h2 className="home-products-title">Our Products</h2>
          <a href="/collection" className="home-products-link">View all →</a>
        </div>

        <div className="products-grid">
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="pcard pcard-skeleton">
              <div className="pcard-img-wrap" />
              <div className="pcard-body">
                <div className="pcard-skeleton-line short" />
                <div className="pcard-skeleton-line medium" />
                <div className="pcard-skeleton-line short" />
              </div>
            </div>
          ))}

          {!loading && featured.length === 0 && (
            <p className="products-empty">No products available yet.</p>
          )}

          {!loading && featured.map(p => (
            <ProductCard key={p.id} product={p} onQuote={openQuote} />
          ))}
        </div>
      </section>

      <Footer />

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} prefill={prefill} />
    </div>
  )
}
