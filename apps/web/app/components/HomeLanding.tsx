'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { GooeyText } from './ui/gooey-text-morphing'

interface Product {
  id: string
  name: string
  display_name: string | null
  description: string | null
  material: string | null
  images: string[] | null
  categories: { name: string } | null
}

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
  const [products,       setProducts]       = useState<Product[]>([])
  const [activeIdx,      setActiveIdx]      = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search,         setSearch]         = useState('')
  const [imgVisible,     setImgVisible]     = useState(true)
  const [mounted,        setMounted]        = useState(false)

  const cursorRef  = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLAnchorElement>(null)
  const swapRef    = useRef<ReturnType<typeof setTimeout>>()
  const cursorRaf  = useRef<number>()
  const curTarget  = useRef({ x: -100, y: -100 })
  const curCurrent = useRef({ x: -100, y: -100 })
  const marquee    = [...TECHNIQUES, ...TECHNIQUES]
  const eyebrow    = useScramble('PREMIUM CUSTOM APPAREL', mounted)

  /* fetch live products */
  useEffect(() => {
    fetch('/api/products/public')
      .then(r => r.json())
      .then((data: Product[]) => { if (Array.isArray(data)) setProducts(data) })
      .catch(() => {})
  }, [])

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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    curTarget.current = { x: e.clientX - 12, y: e.clientY - 12 }
    if (btnRef.current) {
      const r  = btnRef.current.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < 110) {
        const s = (1 - d / 110) * 0.45
        btnRef.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`
      } else {
        btnRef.current.style.transform = ''
      }
    }
  }, [])

  /* derived */
  const categories = Array.from(
    new Set(products.map(p => p.categories?.name).filter(Boolean) as string[])
  )

  const filtered = products.filter(p => {
    const nameMatch = !search ||
      (p.display_name || p.name).toLowerCase().includes(search.toLowerCase())
    const catMatch = !activeCategory || p.categories?.name === activeCategory
    return nameMatch && catMatch
  })

  const safeIdx = Math.min(activeIdx, Math.max(filtered.length - 1, 0))
  const current = filtered[safeIdx] ?? null

  const swap = (fn: () => void, ms: number) => {
    clearTimeout(swapRef.current)
    swapRef.current = setTimeout(fn, ms)
  }

  const changeProduct = (i: number) => {
    if (i === safeIdx) return
    setImgVisible(false)
    swap(() => { setActiveIdx(i); setImgVisible(true) }, 220)
  }

  const changeCategory = (cat: string | null) => {
    setImgVisible(false)
    swap(() => { setActiveCategory(cat); setActiveIdx(0); setImgVisible(true) }, 180)
  }

  const displayName = current ? (current.display_name || current.name) : ''
  const spec        = current ? (current.material || current.description || '') : ''
  const image       = current?.images?.[0] ?? null

  return (
    <div className={`bw-root${mounted ? ' bw-on' : ''}`} onMouseMove={handleMouseMove}>
      <div ref={cursorRef} className="bw-cursor" aria-hidden="true" />
      <div className="bw-rule bw-rule-top" aria-hidden="true" />

      <div className="bw-main">
        <GooeyText
          texts={["Build", "Craft", "Brand", "Create"]}
          morphTime={1}
          cooldownTime={0.25}
          className="gooey-text--landing"
        />

        {/* LEFT */}
        <div className="bw-left">
          <p className="bw-eyebrow">{eyebrow}</p>

          <h1 className="bw-headline" aria-label="Clothes That Build Brands">
            {['Clothes', 'That', 'Build', 'Brands.'].map((w, i) => (
              <span key={w} className="bw-clip">
                <span className="bw-word" style={{ transitionDelay: `${i * 110 + 200}ms` }}>{w}</span>
              </span>
            ))}
          </h1>

          <p className="bw-sub bw-fade bw-d600">
            Premium apparel for brands<br />that refuse to blend in.
          </p>

          <a href="/collection" ref={btnRef} className="bw-cta bw-fade bw-d800" aria-label="Enter Collection">
            <span className="bw-cta-fill" aria-hidden="true" />
            <span className="bw-cta-inner">
              <span>Enter Collection</span>
              <svg viewBox="0 0 56 10" fill="none" aria-hidden="true">
                <line x1="0" y1="5" x2="48" y2="5" stroke="currentColor" strokeWidth="1"/>
                <polyline points="42,1 52,5 42,9" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </span>
          </a>

          <div className="bw-stats bw-fade bw-d1000">
            {[['500+','Brands'],['12+','Years'],['100%','Quality']].map(([n,l],i) => (
              <span key={l} className="bw-stat-group">
                {i > 0 && <span className="bw-dot" aria-hidden="true" />}
                <span className="bw-stat"><strong>{n}</strong><em>{l}</em></span>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bw-right">

          {/* Search bar */}
          <div className="bw-search-wrap">
            <svg className="bw-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" />
            </svg>
            <input
              className="bw-search"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveIdx(0) }}
              aria-label="Search products"
            />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <nav className="bw-tabs" aria-label="Product category">
              <button
                role="tab"
                aria-selected={activeCategory === null}
                className={`bw-tab${activeCategory === null ? ' bw-tab-on' : ''}`}
                onClick={() => changeCategory(null)}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`bw-tab${activeCategory === cat ? ' bw-tab-on' : ''}`}
                  onClick={() => changeCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              {filtered.length > 0 && (
                <span className="bw-tab-counter" aria-hidden="true">
                  {String(safeIdx + 1).padStart(2,'0')}&thinsp;/&thinsp;{String(filtered.length).padStart(2,'0')}
                </span>
              )}
            </nav>
          )}

          {/* Image */}
          <div className="bw-showcase">
            {products.length === 0 && <div className="bw-img-skeleton" />}
            {image ? (
              <Image
                src={image}
                alt={displayName}
                fill
                className={`bw-img${imgVisible ? ' bw-img-on' : ''}`}
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
            ) : (
              products.length > 0 && <div className={`bw-img${imgVisible ? ' bw-img-on' : ''}`} style={{ background: '#F0EFE9' }} />
            )}
          </div>

          {/* Info bar */}
          {current ? (
            <div className="bw-infobar">
              <div className="bw-meta">
                <span className="bw-meta-name">{displayName}</span>
                {spec && <span className="bw-meta-spec">{spec}</span>}
              </div>

              {filtered.length > 1 && (
                <div className="bw-nav">
                  <button className="bw-nav-btn" onClick={() => changeProduct((safeIdx - 1 + filtered.length) % filtered.length)} aria-label="Previous product">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <button className="bw-nav-btn" onClick={() => changeProduct((safeIdx + 1) % filtered.length)} aria-label="Next product">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}

              <button className="bw-qbtn" onClick={() => onOpenQuote(displayName)}>
                <span>Get a Quote</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="bw-infobar">
              <span className="bw-meta-spec">No products match your search</span>
            </div>
          )}

        </div>
      </div>

      <div className="bw-rule" aria-hidden="true" />

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
