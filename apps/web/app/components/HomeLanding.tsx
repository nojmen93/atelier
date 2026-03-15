'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

type Color = 'white' | 'black' | 'blue'

const COLORS: { id: Color; label: string; hex: string }[] = [
  { id: 'white', label: 'White', hex: '#e8e8e7' },
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'blue',  label: 'Navy',  hex: '#2a4a7f' },
]

const PRODUCTS = [
  {
    id: 'tshirt', name: 'Classic T-Shirt', category: 'Tee', spec: '220gsm · Regular Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&q=85',
      blue:  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=85',
    },
  },
  {
    id: 'sweater', name: 'Crewneck Sweater', category: 'Sweater', spec: '380gsm · Relaxed Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85',
      blue:  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=900&q=85',
    },
  },
  {
    id: 'hoodie', name: 'Pullover Hoodie', category: 'Hoodie', spec: '420gsm · Oversized Fit',
    images: {
      white: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=900&q=85',
      black: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85',
      blue:  'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=85',
    },
  },
]

const TECHNIQUES = ['Embroidery', 'Screen Print', 'DTG Print', 'Heat Transfer']
const CHARSET    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'

/* ── Scramble hook ─────────────────────────────────────── */
function useScramble(target: string, trigger: boolean) {
  const [text, setText] = useState(() => target.split('').map(() => ' ').join(''))
  const raf = useRef<number>()

  useEffect(() => {
    if (!trigger) return
    let frame = 0
    const total = target.length
    const SPEED = 2.2

    const tick = () => {
      frame++
      const revealed = Math.min(total, Math.floor(frame / SPEED))
      const out = target.split('').map((ch, i) => {
        if (i < revealed) return ch
        if (ch === ' ') return ' '
        return CHARSET[Math.floor(Math.random() * CHARSET.length)]
      }).join('')
      setText(out)
      if (revealed < total) raf.current = requestAnimationFrame(tick)
      else setText(target)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current!)
  }, [trigger, target])

  return text
}

/* ── Component ─────────────────────────────────────────── */
interface Props { onOpenQuote: (product?: string) => void }

export default function HomeLanding({ onOpenQuote }: Props) {
  const [activeProduct, setActiveProduct] = useState(0)
  const [activeColor,   setActiveColor]   = useState<Color>('black')
  const [imgVisible,    setImgVisible]    = useState(true)
  const [mounted,       setMounted]       = useState(false)

  const cursorRef  = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLButtonElement>(null)
  const swapRef    = useRef<ReturnType<typeof setTimeout>>()
  const cursorRaf  = useRef<number>()
  const curTarget  = useRef({ x: -100, y: -100 })
  const curCurrent = useRef({ x: -100, y: -100 })

  const current   = PRODUCTS[activeProduct]
  const colorData = COLORS.find(c => c.id === activeColor)!
  const marquee   = [...TECHNIQUES, ...TECHNIQUES]

  const eyebrow  = useScramble('PREMIUM CUSTOM APPAREL', mounted)

  /* mount */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => {
      clearTimeout(t)
      clearTimeout(swapRef.current)
      cancelAnimationFrame(cursorRaf.current!)
    }
  }, [])

  /* cursor lerp loop */
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      curCurrent.current.x = lerp(curCurrent.current.x, curTarget.current.x, 0.1)
      curCurrent.current.y = lerp(curCurrent.current.y, curTarget.current.y, 0.1)
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${curCurrent.current.x}px, ${curCurrent.current.y}px)`
      }
      cursorRaf.current = requestAnimationFrame(tick)
    }
    cursorRaf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(cursorRaf.current!)
  }, [])

  /* mouse: cursor + magnetic button */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    curTarget.current = { x: e.clientX - 12, y: e.clientY - 12 }

    if (btnRef.current) {
      const r  = btnRef.current.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const d  = Math.sqrt(dx * dx + dy * dy)
      const th = 110
      if (d < th) {
        const s = (1 - d / th) * 0.45
        btnRef.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`
      } else {
        btnRef.current.style.transform = ''
      }
    }
  }, [])

  const swap = (fn: () => void, ms: number) => {
    clearTimeout(swapRef.current)
    swapRef.current = setTimeout(fn, ms)
  }

  const changeProduct = (i: number) => {
    if (i === activeProduct) return
    setImgVisible(false)
    swap(() => { setActiveProduct(i); setActiveColor('black'); setImgVisible(true) }, 220)
  }

  const changeColor = (c: Color) => {
    if (c === activeColor) return
    setImgVisible(false)
    swap(() => { setActiveColor(c); setImgVisible(true) }, 180)
  }

  return (
    <div
      className={`bw-root${mounted ? ' bw-on' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* ── Blend-mode cursor ──────────────────────── */}
      <div ref={cursorRef} className="bw-cursor" aria-hidden="true" />

      {/* ── Top divider (draws in on mount) ────────── */}
      <div className="bw-rule bw-rule-top" aria-hidden="true" />

      {/* ── Main split ─────────────────────────────── */}
      <div className="bw-main">

        {/* LEFT — typography */}
        <div className="bw-left">

          <p className="bw-eyebrow">{eyebrow}</p>

          <h1 className="bw-headline" aria-label="Clothes That Build Brands">
            {['Clothes', 'That', 'Build', 'Brands.'].map((w, i) => (
              <span key={w} className="bw-clip">
                <span className="bw-word" style={{ transitionDelay: `${i * 110 + 200}ms` }}>
                  {w}
                </span>
              </span>
            ))}
          </h1>

          <p className="bw-sub bw-fade bw-d600">
            Premium apparel for brands<br />that refuse to blend in.
          </p>

          {/* Magnetic CTA */}
          <button
            ref={btnRef}
            className="bw-cta bw-fade bw-d800"
            onClick={() => onOpenQuote()}
            aria-label="Enter Collection"
          >
            <span className="bw-cta-fill" aria-hidden="true" />
            <span className="bw-cta-inner">
              <span>Enter Collection</span>
              <svg viewBox="0 0 56 10" fill="none" aria-hidden="true">
                <line x1="0" y1="5" x2="48" y2="5" stroke="currentColor" strokeWidth="1"/>
                <polyline points="42,1 52,5 42,9" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </span>
          </button>

          {/* Stats */}
          <div className="bw-stats bw-fade bw-d1000">
            {[['500+','Brands'],['12+','Years'],['100%','Quality']].map(([n,l],i) => (
              <span key={l} className="bw-stat-group">
                {i > 0 && <span className="bw-dot" aria-hidden="true" />}
                <span className="bw-stat">
                  <strong>{n}</strong>
                  <em>{l}</em>
                </span>
              </span>
            ))}
          </div>

        </div>

        {/* RIGHT — product */}
        <div className="bw-right">

          {/* Tabs */}
          <nav className="bw-tabs" aria-label="Product type">
            {PRODUCTS.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={activeProduct === i}
                className={`bw-tab${activeProduct === i ? ' bw-tab-on' : ''}`}
                onClick={() => changeProduct(i)}
              >
                {p.category}
              </button>
            ))}
            <span className="bw-tab-counter" aria-hidden="true">
              {String(activeProduct + 1).padStart(2,'0')}&thinsp;/&thinsp;{String(PRODUCTS.length).padStart(2,'0')}
            </span>
          </nav>

          {/* Image */}
          <div className="bw-showcase">
            <Image
              src={current.images[activeColor]}
              alt={`${current.name} in ${colorData.label}`}
              fill
              className={`bw-img${imgVisible ? ' bw-img-on' : ''}`}
              sizes="(max-width: 768px) 100vw, 42vw"
              priority
            />
          </div>

          {/* Info bar */}
          <div className="bw-infobar">
            <div className="bw-meta">
              <span className="bw-meta-name">{current.name}</span>
              <span className="bw-meta-spec">{current.spec}</span>
            </div>

            <div className="bw-swatches">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  className={`bw-swatch${activeColor === c.id ? ' bw-swatch-on' : ''}`}
                  style={{ '--sc': c.hex } as React.CSSProperties}
                  onClick={() => changeColor(c.id)}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
              <span className="bw-color-name">{colorData.label}</span>
            </div>

            <button
              className="bw-qbtn"
              onClick={() => onOpenQuote(`${current.name} (${colorData.label})`)}
            >
              <span>Get a Quote</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── Bottom divider ──────────────────────────── */}
      <div className="bw-rule" aria-hidden="true" />

      {/* ── Marquee ────────────────────────────────── */}
      <div className="bw-marquee" aria-hidden="true">
        <div className="bw-marquee-track">
          {marquee.map((t, i) => (
            <span key={i} className="bw-marquee-item">
              <span className="bw-marquee-dash">—</span>{t}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
