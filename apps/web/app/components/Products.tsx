'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  display_name: string | null
  description: string | null
  material: string | null
  images: string[] | null
  categories: { name: string } | null
}

function ProductCard({ product }: { product: Product }) {
  const displayName = product.display_name || product.name
  const image = product.images?.[0] ?? null
  const category = product.categories?.name ?? null

  const handleQuote = () => {
    window.dispatchEvent(new CustomEvent('productinterest', { detail: displayName }))
    const section = document.getElementById('quote')
    if (section) section.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="product-card">
      <div className="product-card-image">
        {image ? (
          <Image
            src={image}
            alt={displayName}
            fill
            className="product-card-img"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="product-card-placeholder" />
        )}
        {category && <div className="product-card-tag">{category}</div>}
      </div>

      <div className="product-card-body">
        <div className="product-card-top">
          <h3 className="product-card-name">{displayName}</h3>
          {(product.description || product.material) && (
            <p className="product-card-desc">
              {product.description || product.material}
            </p>
          )}
        </div>

        <div className="product-card-footer">
          <button className="product-quote-btn" onClick={handleQuote}>
            Get a Quote
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products/public')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
  }, [])

  if (products.length === 0) return null

  return (
    <section className="products section" id="products">
      <div className="container">
        <div className="products-header">
          <p className="label">Our Products</p>
          <h2 className="headline-lg products-title">Premium Blanks,<br />Your Brand</h2>
          <p className="products-sub">
            We source only the best base garments. Every piece is carefully selected for weight, fit, and printability.
          </p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="products-techniques">
          {['Embroidery', 'Screen Print', 'DTG Print', 'Heat Transfer'].map((t) => (
            <div key={t} className="technique-chip">{t}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
