'use client'

import { useRef, useCallback } from 'react'
import Image from 'next/image'

const featuredProducts = [
  {
    id: 'sweater',
    name: 'Crewneck Sweater',
    category: 'Sweater',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85',
  },
  {
    id: 'tshirt',
    name: 'Classic T-Shirt',
    category: 'Tee',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=85',
  },
]

function HeroProductCard({
  product,
  position,
}: {
  product: (typeof featuredProducts)[0]
  position: 'left' | 'center' | 'right'
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!outerRef.current || !tiltRef.current) return
    const rect = outerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    tiltRef.current.style.setProperty('--tilt-x', `${y * -14}deg`)
    tiltRef.current.style.setProperty('--tilt-y', `${x * 14}deg`)
    tiltRef.current.style.setProperty('--shine-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    tiltRef.current.style.setProperty('--shine-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
    tiltRef.current.style.setProperty('--shine-opacity', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!tiltRef.current) return
    tiltRef.current.style.setProperty('--tilt-x', '0deg')
    tiltRef.current.style.setProperty('--tilt-y', '0deg')
    tiltRef.current.style.setProperty('--shine-opacity', '0')
  }, [])

  return (
    <div
      ref={outerRef}
      className={`hero-product hero-product--${position}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-product-float">
        <div
          ref={tiltRef}
          className="hero-product-tilt"
          style={
            {
              '--tilt-x': '0deg',
              '--tilt-y': '0deg',
              '--shine-x': '50%',
              '--shine-y': '50%',
              '--shine-opacity': '0',
            } as React.CSSProperties
          }
        >
          <div className="hero-product-card">
            <div className="hero-product-shine" />
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="hero-product-img"
              sizes="(max-width: 768px) 80vw, 30vw"
            />
            <div className="hero-product-info">
              <span className="hero-product-category">{product.category}</span>
              <span className="hero-product-name">{product.name}</span>
            </div>
          </div>
          <div className="hero-product-glow" />
        </div>
      </div>
    </div>
  )
}

function MagneticBtn({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.28
    const y = (e.clientY - r.top - r.height / 2) * 0.28
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }, [])

  const onLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = ''
  }, [])

  return (
    <a ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </a>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grain" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="hero-ghost-text" aria-hidden="true">
        <span>Build</span>
        <span>Brands</span>
      </div>

      <div className="hero-top">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-line" />
          <span>Premium Custom Apparel</span>
          <span className="hero-eyebrow-line" />
        </div>
      </div>

      <div className="hero-showcase">
        {featuredProducts.map((product, i) => {
          const pos = (['left', 'center', 'right'] as const)[i]
          return <HeroProductCard key={product.id} product={product} position={pos} />
        })}
      </div>

      <div className="hero-bottom">
        <p className="hero-tagline">
          We craft premium branded apparel for companies that refuse to blend in.
        </p>

        <div className="hero-actions">
          <MagneticBtn href="#quote" className="btn btn--primary">
            Request a Quote
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </MagneticBtn>
          <a href="#products" className="btn btn--ghost">
            View Products
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">500+</span>
            <span className="hero-stat-label">Brands Served</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">12+</span>
            <span className="hero-stat-label">Years Experience</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">100%</span>
            <span className="hero-stat-label">Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  )
}
