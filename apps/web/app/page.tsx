'use client'

import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ProductCard, { type Product } from './components/ProductCard'
import QuoteModal from './components/QuoteModal'
import ProductModal from './components/ProductModal'
import { Boxes } from './components/ui/background-boxes'
import { ImageReveal } from './components/ui/image-tiles'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [prefill, setPrefill] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  const fallbackImgs = [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
  ]
  const heroImgs = [
    featured[0]?.images?.[0] ?? fallbackImgs[0],
    featured[1]?.images?.[0] ?? fallbackImgs[1],
    featured[2]?.images?.[0] ?? fallbackImgs[2],
  ]

  return (
    <div className="page-home">
      {/* Full-page animated grid background — fixed, behind everything */}
      <Boxes />

      <Nav onOpenQuote={() => openQuote()} />

      {/* Hero */}
      <section className="home-hero">

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
            <ImageReveal
              leftImage={heroImgs[0]}
              middleImage={heroImgs[1]}
              rightImage={heroImgs[2]}
            />
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
            <ProductCard key={p.id} product={p} onQuote={openQuote} onSelect={setSelectedProduct} />
          ))}
        </div>
      </section>

      <Footer />

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} prefill={prefill} />
      <ProductModal
        open={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onQuote={(name) => { setSelectedProduct(null); openQuote(name) }}
      />
    </div>
  )
}
