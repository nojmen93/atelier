'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [mounted, setMounted] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })

  const current = products[activeProduct]
  const colorData = colors.find((c) => c.id === activeColor)!
  const marqueeItems = [...techniques, ...techniques]

  useEffect(() => {
    setMounted(true)
    return () => {
      clearTimeout(timeoutRef.current)
      cancelAnimationFrame(rafRef.current!)
    }
  }, [])

  // Smooth parallax loop via lerp
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.055)
      mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.055)
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translate(${mouseCurrent.current.x}px, ${mouseCurrent.current.y}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = rightPanelRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    mouseTarget.current = { x: cx * -14, y: cy * -9 }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseTarget.current = { x: 0, y: 0 }
  }, [])

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

  return (
    <div className={`hl-root${mounted ? ' hl-mounted' : ''}`}>

      {/* ═══════════════════════════════
          LEFT PANEL — dark editorial
      ═══════════════════════════════ */}
      <div className="hl-left">
        <div className="hl-left-inner">

          {/* Brand mark */}
          <div className="hl-brand-row">
            <span className="hl-brand-name">Atelier</span>
            <span className="hl-brand-est">Est. 2012</span>
          </div>

          {/* Editorial headline — each word reveals upward */}
          <h1 className="hl-headline" aria-label="Clothes That Build Brands">
            {['Clothes', 'That', 'Build', 'Brands.'].map((word, i) => (
              <span key={word} className="hl-word-wrap">
                <span
                  className="hl-word"
                  style={{ transitionDelay: `${i * 95 + 60}ms` }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          {/* Tagline */}
          <p className="hl-tagline hl-delay-500">
            Premium branded apparel for brands<br />
            that refuse to blend in.
          </p>

          {/* Primary CTA */}
          <button
            className="hl-cta hl-delay-660"
            onClick={() => onOpenQuote()}
            aria-label="Enter Collection"
          >
            <span className="hl-cta-text">Enter Collection</span>
            <span className="hl-cta-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>

          {/* Stats */}
          <div className="hl-stats hl-delay-800">
            {[
              { num: '500+', label: 'Brands Served' },
              { num: '12+', label: 'Years' },
              { num: '100%', label: 'Quality' },
            ].map((s, i) => (
              <div key={s.label} className="hl-stat-group">
                {i > 0 && <div className="hl-stat-sep" aria-hidden="true" />}
                <div className="hl-stat">
                  <span className="hl-stat-num">{s.num}</span>
                  <span className="hl-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════
          RIGHT PANEL — creme product
      ═══════════════════════════════ */}
      <div
        className="hl-right"
        ref={rightPanelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Product tabs */}
        <div className="hl-tabs" role="tablist">
          {products.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={activeProduct === i}
              className={`hl-tab${activeProduct === i ? ' hl-tab-active' : ''}`}
              onClick={() => changeProduct(i)}
            >
              {p.category}
            </button>
          ))}
        </div>

        {/* Product image with parallax */}
        <div className="hl-showcase">
          <div className="hl-img-wrap" ref={imgWrapRef}>
            <Image
              src={current.images[activeColor]}
              alt={`${current.name} in ${colorData.label}`}
              fill
              className={`hl-img${imgVisible ? ' hl-img-visible' : ''}`}
              sizes="(max-width: 768px) 100vw, 58vw"
              priority
            />
          </div>
        </div>

        {/* Product info bar */}
        <div className="hl-info-bar">
          <div className="hl-info-meta">
            <div className="hl-info-name">{current.name}</div>
            <div className="hl-info-spec">{current.spec}</div>
          </div>

          <div className="hl-color-row">
            {colors.map((c) => (
              <button
                key={c.id}
                className={`hl-swatch${activeColor === c.id ? ' hl-swatch-active' : ''}`}
                style={{ '--swatch-color': c.hex } as React.CSSProperties}
                onClick={() => changeColor(c.id)}
                aria-label={c.label}
                title={c.label}
              />
            ))}
            <span className="hl-color-label">{colorData.label}</span>
          </div>

          <button
            className="hl-quote-btn"
            onClick={() => onOpenQuote(`${current.name} (${colorData.label})`)}
          >
            <span>Get a Quote</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Techniques marquee */}
        <div className="hl-marquee-strip" aria-hidden="true">
          <div className="hl-marquee-track">
            {marqueeItems.map((t, i) => (
              <span key={i} className="hl-marquee-item">
                <span className="hl-marquee-dot" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
