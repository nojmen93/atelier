'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  display_name: string | null
  description: string | null
  material: string | null
  images: string[] | null
  categories: { name: string } | null
}

function ProductCard({ product, onQuote }: { product: Product; onQuote: (name: string) => void }) {
  const displayName = product.display_name || product.name
  const image = product.images?.[0] ?? null
  const category = product.categories?.name ?? null
  const spec = product.material || product.description || null

  return (
    <article className="col-card">
      <div className="col-card-img-wrap">
        {image ? (
          <Image
            src={image}
            alt={displayName}
            fill
            className="col-card-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="col-card-img-empty" />
        )}
        <div className="col-card-overlay">
          <button className="col-card-quote-btn" onClick={() => onQuote(displayName)}>
            Get a Quote
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="col-card-body">
        {category && <span className="col-card-category">{category}</span>}
        <h2 className="col-card-name">{displayName}</h2>
        {spec && <p className="col-card-spec">{spec}</p>}
      </div>
    </article>
  )
}

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleQuote = (productName: string) => {
    window.dispatchEvent(new CustomEvent('productinterest', { detail: productName }))
    window.location.href = '/#quote'
  }

  const categories = Array.from(
    new Set(products.map(p => p.categories?.name).filter(Boolean) as string[])
  )

  const filtered = activeCategory
    ? products.filter(p => p.categories?.name === activeCategory)
    : products

  return (
    <div className="col-page">

      {/* Header */}
      <header className="col-header">
        <Link href="/" className="col-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="col-header-text">
          <p className="col-eyebrow">Premium Custom Apparel</p>
          <h1 className="col-title">The Collection</h1>
          <p className="col-sub">Every piece is available for custom branding. Select a product and request a quote.</p>
        </div>
      </header>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="col-filters">
          <button
            className={`col-filter-btn${activeCategory === null ? ' active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All <span className="col-filter-count">{products.length}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`col-filter-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <span className="col-filter-count">
                {products.filter(p => p.categories?.name === cat).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <main className="col-grid">
        {loading && (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-card-skeleton" />
            ))}
          </>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-empty">
            <p>No products available yet.</p>
          </div>
        )}
        {!loading && filtered.map(product => (
          <ProductCard key={product.id} product={product} onQuote={handleQuote} />
        ))}
      </main>

      {/* Footer CTA */}
      {!loading && filtered.length > 0 && (
        <div className="col-footer-cta">
          <p>Don&apos;t see what you&apos;re looking for?</p>
          <a href="/#quote" className="col-cta-btn">
            Request a Custom Product
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}
