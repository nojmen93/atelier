'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

type Color = 'white' | 'black' | 'blue'

const colors: { id: Color; label: string; hex: string }[] = [
  { id: 'white', label: 'White', hex: '#e8e8e7' },
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'blue', label: 'Navy', hex: '#2a4a7f' },
]

const products = [
  {
    id: 'tshirt',
    name: 'Classic T-Shirt',
    category: 'Tee',
    spec: '220gsm · Regular Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&q=85',
      blue: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=85',
    },
  },
  {
    id: 'sweater',
    name: 'Crewneck Sweater',
    category: 'Sweater',
    spec: '380gsm · Relaxed Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85',
      blue: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=900&q=85',
    },
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    category: 'Hoodie',
    spec: '420gsm · Oversized Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85',
      blue: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=85',
    },
  },
]

const techniques = ['Embroidery', 'Screen Print', 'DTG Print', 'Heat Transfer']

interface Props {
  onOpenQuote: (product?: string) => void
}

export default function HomeLanding({ onOpenQuote }: Props) {
  const [activeProduct, setActiveProduct] = useState(0)
  const [activeColor, setActiveColor] = useState<Color>('black')
  const [imgVisible, setImgVisible] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const current = products[activeProduct]
  const colorData = colors.find((c) => c.id === activeColor)!

  const changeProduct = (i: number) => {
    if (i === activeProduct) return
    setImgVisible(false)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveProduct(i)
      setActiveColor('black')
      setImgVisible(true)
    }, 220)
  }

  const changeColor = (c: Color) => {
    if (c === activeColor) return
    setImgVisible(false)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveColor(c)
      setImgVisible(true)
    }, 180)
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  // Duplicate for seamless marquee loop
  const marqueeItems = [...techniques, ...techniques]

  return (
    <div className="landing">

      {/* ════════════════════════════════
          LEFT PANEL — dark editorial
      ════════════════════════════════ */}
      <div className="landing-left">

        {/* Top row: eyebrow + index */}
        <div className="landing-top-row">
          <span className="landing-eyebrow">Premium Custom Apparel</span>
          <span className="landing-index">Est. 2012</span>
        </div>

        {/* Massive display headline */}
        <h1 className="landing-headline" aria-label="Clothes That Build Brands">
          <span>Clothes</span>
          <span>That</span>
          <span>Build</span>
          <span className="landing-headline-accent">Brands.</span>
        </h1>

        {/* Bottom block: sub + CTA + stats */}
        <div className="landing-bottom">
          <p className="landing-sub">
            Premium branded apparel for companies that refuse to blend in.
            Embroidery, screen print, and everything between — done right.
          </p>

          <button className="landing-cta-btn" onClick={() => onOpenQuote()}>
            <span>Request a Quote</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-num">500+</span>
              <span className="landing-stat-label">Brands Served</span>
            </div>
            <div className="landing-stat-div" />
            <div className="landing-stat">
              <span className="landing-stat-num">12+</span>
              <span className="landing-stat-label">Years</span>
            </div>
            <div className="landing-stat-div" />
            <div className="landing-stat">
              <span className="landing-stat-num">100%</span>
              <span className="landing-stat-label">Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT PANEL — light product
      ════════════════════════════════ */}
      <div className="landing-right">

        {/* Product tabs */}
        <div className="product-tabs" role="tablist">
          {products.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={activeProduct === i}
              className={`product-tab${activeProduct === i ? ' active' : ''}`}
              onClick={() => changeProduct(i)}
            >
              {p.category}
            </button>
          ))}
        </div>

        {/* Product image */}
        <div className="product-showcase">
          <Image
            src={current.images[activeColor]}
            alt={`${current.name} in ${colorData.label}`}
            fill
            className={`product-showcase-img${imgVisible ? ' visible' : ''}`}
            sizes="(max-width: 768px) 100vw, 56vw"
            priority
          />
        </div>

        {/* Product info bar */}
        <div className="product-info-bar">
          <div className="product-info-meta">
            <div className="product-info-name">{current.name}</div>
            <div className="product-info-spec">{current.spec}</div>
          </div>

          <div className="product-color-row">
            {colors.map((c) => (
              <button
                key={c.id}
                className={`color-swatch${activeColor === c.id ? ' active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => changeColor(c.id)}
                aria-label={c.label}
                title={c.label}
              />
            ))}
            <span className="color-swatch-label">{colorData.label}</span>
          </div>

          <button
            className="landing-quote-btn"
            onClick={() => onOpenQuote(`${current.name} (${colorData.label})`)}
          >
            <span>Get a Quote</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Techniques marquee */}
        <div className="techniques-strip" aria-hidden="true">
          <div className="techniques-track">
            {marqueeItems.map((t, i) => (
              <span key={i} className="technique-tag">
                <span className="technique-dot" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
