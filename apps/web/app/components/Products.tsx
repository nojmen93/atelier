'use client'

import { useState } from 'react'
import Image from 'next/image'

type Color = 'white' | 'black' | 'blue'

const colors: { id: Color; label: string; hex: string }[] = [
  { id: 'white', label: 'White', hex: '#f5f5f3' },
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'blue', label: 'Blue', hex: '#2a4a7f' },
]

const products = [
  {
    id: 'tshirt',
    name: 'Classic T-Shirt',
    category: 'Tee',
    description: '220gsm ringspun cotton. Regular fit. Available in embroidery or screen print.',
    images: {
      white: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
      black: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=85',
      blue: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85',
    },
  },
  {
    id: 'sweater',
    name: 'Crewneck Sweater',
    category: 'Sweater',
    description: '380gsm fleece. Relaxed fit. Embroidered logo placement on chest or sleeve.',
    images: {
      white: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85',
      black: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85',
      blue: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=85',
    },
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    category: 'Hoodie',
    description: '420gsm heavy fleece. Oversized fit. Kangaroo pocket. Embroidery or DTG.',
    images: {
      white: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=800&q=85',
      black: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=85',
      blue: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=85',
    },
  },
]

function ProductCard({ product }: { product: typeof products[0] }) {
  const [activeColor, setActiveColor] = useState<Color>('white')

  const handleQuote = () => {
    const form = document.getElementById('quote')
    if (form) form.scrollIntoView({ behavior: 'smooth' })
    const productField = document.getElementById('product-interest') as HTMLInputElement | null
    if (productField) {
      productField.value = `${product.name} (${colors.find(c => c.id === activeColor)?.label})`
      productField.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <div className="product-card">
      <div className="product-card-image">
        <Image
          src={product.images[activeColor]}
          alt={`${product.name} in ${activeColor}`}
          fill
          className="product-card-img"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="product-card-tag">{product.category}</div>
      </div>

      <div className="product-card-body">
        <div className="product-card-top">
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-desc">{product.description}</p>
        </div>

        <div className="product-card-footer">
          <div className="product-colors">
            {colors.map((color) => (
              <button
                key={color.id}
                className={`product-color-dot ${activeColor === color.id ? 'active' : ''}`}
                style={{ background: color.hex }}
                onClick={() => setActiveColor(color.id)}
                aria-label={color.label}
                title={color.label}
              />
            ))}
            <span className="product-color-label">
              {colors.find(c => c.id === activeColor)?.label}
            </span>
          </div>

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
