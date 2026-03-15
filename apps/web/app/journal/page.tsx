'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Nav from '../components/Nav'

/* ─── Article data ─────────────────────────────────────── */
const posts = [
  {
    id: '1',
    title: 'Why Your Merch Strategy Is Failing',
    slug: 'why-your-merch-strategy-is-failing',
    category: 'Strategy',
    readTime: 6,
  },
  {
    id: '2',
    title: 'The Psychology of Premium Branded Apparel',
    slug: 'psychology-of-premium-branded-apparel',
    category: 'Insights',
    readTime: 8,
  },
  {
    id: '3',
    title: 'Embroidery vs. Screen Print',
    slug: 'embroidery-vs-screen-print',
    category: 'Production',
    readTime: 5,
  },
  {
    id: '4',
    title: 'Building a Capsule Collection',
    slug: 'building-capsule-collection',
    category: 'Design',
    readTime: 7,
  },
]

/* ─── T-shirt SVG path (300 × 290 coordinate space) ─────── */
const SHIRT_PATH = 'M 102,58 Q 150,28 198,58 L 258,66 L 288,102 L 270,148 L 230,124 L 230,268 L 70,268 L 70,124 L 30,148 L 12,102 L 42,66 Z'
const SHIRT_W    = 300
const SHIRT_H    = 290
const STITCH_GAP = 6       // px between consecutive stitches
const STITCH_LEN = 11      // visual length of each stitch
const STITCH_SPD = 0.12    // animation progress per frame
const GOLD       = '#CA8A04'
const GOLD_RGB   = '202,138,4'

interface Stitch {
  x: number
  y: number
  angle: number
  progress: number  // 0 → 1 (draw-in animation)
  glow: number      // 1 → 0 (glow decay)
  gold: boolean     // alternating gold accent
}

/* ─── Page component ─────────────────────────────────────── */
export default function JournalPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef      = useRef<Path2D | null>(null)
  const tfRef        = useRef({ scale: 1, ox: 0, oy: 0 })
  const stitchesRef  = useRef<Stitch[]>([])
  const lastPosRef   = useRef<{ x: number; y: number } | null>(null)
  const cursorRef    = useRef<{ x: number; y: number } | null>(null)
  const insideRef    = useRef(false)
  const distAccRef   = useRef(0)
  const rafRef       = useRef<number | null>(null)

  const [count, setCount]         = useState(0)
  const [inside, setInside]       = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [entered, setEntered]     = useState(false)

  /* ── draw loop ───────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !pathRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { scale, ox, oy } = tfRef.current

    /* shirt outline — subtle on dark bg */
    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(scale, scale)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth   = 1.5 / scale
    ctx.lineJoin    = 'round'
    ctx.stroke(pathRef.current)
    ctx.restore()

    /* glow halos first (behind stitches) */
    for (const s of stitchesRef.current) {
      if (s.glow > 0) {
        s.glow = Math.max(0, s.glow - 0.028)
        const r = 18 * s.glow
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r)
        g.addColorStop(0, `rgba(${GOLD_RGB},${s.glow * 0.55})`)
        g.addColorStop(1, `rgba(${GOLD_RGB},0)`)
        ctx.beginPath()
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
    }

    /* stitches — animated draw-in */
    let animating = false
    for (const s of stitchesRef.current) {
      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + STITCH_SPD)
        animating = true
      }
      if (s.glow > 0) animating = true

      const len = STITCH_LEN * s.progress
      const dx  = Math.cos(s.angle) * len / 2
      const dy  = Math.sin(s.angle) * len / 2

      ctx.beginPath()
      ctx.moveTo(s.x - dx, s.y - dy)
      ctx.lineTo(s.x + dx, s.y + dy)

      if (s.gold) {
        ctx.strokeStyle = `rgba(${GOLD_RGB},${0.4 + s.progress * 0.6})`
        ctx.lineWidth   = 1.6
      } else {
        ctx.strokeStyle = `rgba(255,255,255,${0.18 + s.progress * 0.62})`
        ctx.lineWidth   = 1.2
      }
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    /* live thread trail — dashed gold line from last stitch to cursor */
    const cursor = cursorRef.current
    const last   = lastPosRef.current
    if (cursor && last && insideRef.current) {
      ctx.save()
      ctx.strokeStyle = GOLD
      ctx.lineWidth   = 0.8
      ctx.globalAlpha = 0.45
      ctx.setLineDash([3, 7])
      ctx.lineDashOffset = -performance.now() / 60
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(cursor.x, cursor.y)
      ctx.stroke()
      ctx.restore()
      animating = true
    }

    if (animating) {
      rafRef.current = requestAnimationFrame(draw)
    }
  }, [])

  /* ── init + resize observer ──────────────────────────── */
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    pathRef.current = new Path2D(SHIRT_PATH)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.width  = width
      canvas.height = height

      const scale = Math.min(width / SHIRT_W, height / SHIRT_H) * 0.76
      tfRef.current = {
        scale,
        ox: (width  - SHIRT_W * scale) / 2,
        oy: (height - SHIRT_H * scale) / 2,
      }
      draw()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [draw])

  /* ── entrance animation trigger ─────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80)
    return () => clearTimeout(t)
  }, [])

  /* ── point-in-shirt test ─────────────────────────────── */
  const isInShirt = useCallback((x: number, y: number): boolean => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !pathRef.current) return false
    const { scale, ox, oy } = tfRef.current
    return ctx.isPointInPath(pathRef.current, (x - ox) / scale, (y - oy) / scale)
  }, [])

  /* ── mouse move — stitch placement ──────────────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      cursorRef.current = { x, y }

      if (!isInShirt(x, y)) {
        insideRef.current = false
        setInside(false)
        lastPosRef.current = null
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      insideRef.current = true
      setInside(true)

      if (!lastPosRef.current) {
        lastPosRef.current = { x, y }
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const dx   = x - lastPosRef.current.x
      const dy   = y - lastPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      distAccRef.current += dist

      /* perpendicular to direction of travel + tiny random jitter */
      const angle = Math.atan2(dy, dx) + Math.PI / 2 + (Math.random() - 0.5) * 0.3

      while (distAccRef.current >= STITCH_GAP) {
        const isGold = stitchesRef.current.length % 7 < 2
        stitchesRef.current.push({ x, y, angle, progress: 0, glow: 1, gold: isGold })
        distAccRef.current -= STITCH_GAP
        setCount(c => c + 1)
      }

      lastPosRef.current = { x, y }

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
    },
    [isInShirt, draw]
  )

  const handleMouseLeave = useCallback(() => {
    insideRef.current = false
    setInside(false)
    cursorRef.current = null
    lastPosRef.current = null
    distAccRef.current = 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  /* ── reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    stitchesRef.current = []
    setCount(0)
    draw()
  }, [draw])

  const countStr = String(count).padStart(4, '0')

  return (
    <div className="jpage">
      <Nav />

      <div className="jlayout">

        {/* ── LEFT ── */}
        <div className={`jleft${entered ? ' j-entered' : ''}`}>

          {/* ghost watermark counter */}
          <div className="j-ghost-count" aria-hidden="true">{countStr}</div>

          <div className="jleft-top">
            <span className="jeyebrow j-fade-item" style={{ '--ji': 0 } as React.CSSProperties}>The Journal</span>
            <h1 className="jtitle">
              <span className="jtitle-word j-fade-item" style={{ '--ji': 1 } as React.CSSProperties}>The</span>
              <span className="jtitle-word j-fade-item" style={{ '--ji': 2 } as React.CSSProperties}>Stitch</span>
              <span className="jtitle-word j-fade-item" style={{ '--ji': 3 } as React.CSSProperties}>Index</span>
            </h1>
            <p className="jdesc j-fade-item" style={{ '--ji': 4 } as React.CSSProperties}>
              Move your cursor over the shirt.<br />
              Every thread is a thought.
            </p>
          </div>

          <div className="jcounter j-fade-item" style={{ '--ji': 5 } as React.CSSProperties}>
            <span className="jcount-num">{countStr}</span>
            <span className="jcount-label">Threads Applied</span>
          </div>

          <nav className="jarticles j-fade-item" style={{ '--ji': 6 } as React.CSSProperties} aria-label="Articles">
            {posts.map((p, i) => (
              <Link
                key={p.id}
                href={`/journal/${p.slug}`}
                className={`jarticle${activeIdx === i ? ' active' : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <span className="jarticle-num">0{i + 1}</span>
                <div className="jarticle-body">
                  <span className="jarticle-cat">{p.category}</span>
                  <span className="jarticle-title">{p.title}</span>
                </div>
                <span className="jarticle-time">{p.readTime}m</span>
              </Link>
            ))}
          </nav>

          {count > 0 && (
            <button className="jreset" onClick={reset} type="button">
              Clear canvas
            </button>
          )}
        </div>

        {/* ── RIGHT — dark interactive canvas ── */}
        <div className="jright" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="jcanvas"
            style={{ cursor: inside ? 'crosshair' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* corner label */}
          <div className="j-corner-label" aria-hidden="true">
            <span className="j-corner-dot" />
            Interactive
          </div>

          {/* live thread count overlay */}
          {count > 0 && (
            <div className="j-canvas-count" aria-hidden="true">
              <span className="j-canvas-count-num">{countStr}</span>
              <span className="j-canvas-count-label">threads</span>
            </div>
          )}

          {count === 0 && (
            <div className="jhint" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Hover the shirt to stitch
            </div>
          )}

          {/* marquee ticker */}
          <div className="j-marquee" aria-hidden="true">
            <div className="j-marquee-track">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="j-marquee-inner">
                  EMBROIDERY&nbsp;&nbsp;·&nbsp;&nbsp;SCREEN PRINT&nbsp;&nbsp;·&nbsp;&nbsp;DTG PRINT&nbsp;&nbsp;·&nbsp;&nbsp;HEAT TRANSFER&nbsp;&nbsp;·&nbsp;&nbsp;CUSTOM APPAREL&nbsp;&nbsp;·&nbsp;&nbsp;ATELIER STUDIO&nbsp;&nbsp;·&nbsp;&nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
