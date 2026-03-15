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
const STITCH_GAP = 7      // px between consecutive stitches
const STITCH_LEN = 10     // visual length of each stitch
const STITCH_SPD = 0.1    // animation progress per frame

interface Stitch {
  x: number
  y: number
  angle: number
  progress: number // 0 → 1 (draw-in animation)
}

/* ─── Page component ─────────────────────────────────────── */
export default function JournalPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef      = useRef<Path2D | null>(null)
  const tfRef        = useRef({ scale: 1, ox: 0, oy: 0 })
  const stitchesRef  = useRef<Stitch[]>([])
  const lastPosRef   = useRef<{ x: number; y: number } | null>(null)
  const distAccRef   = useRef(0)
  const rafRef       = useRef<number | null>(null)

  const [count, setCount]         = useState(0)
  const [inside, setInside]       = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  /* ── draw loop ───────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !pathRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { scale, ox, oy } = tfRef.current

    /* shirt outline */
    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(scale, scale)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth   = 1.5 / scale
    ctx.lineJoin    = 'round'
    ctx.stroke(pathRef.current)
    ctx.restore()

    /* stitches — animated draw-in */
    let animating = false
    for (const s of stitchesRef.current) {
      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + STITCH_SPD)
        animating = true
      }
      const len = STITCH_LEN * s.progress
      const dx  = Math.cos(s.angle) * len / 2
      const dy  = Math.sin(s.angle) * len / 2

      ctx.beginPath()
      ctx.moveTo(s.x - dx, s.y - dy)
      ctx.lineTo(s.x + dx, s.y + dy)
      ctx.strokeStyle = `rgba(10,10,10,${0.25 + s.progress * 0.75})`
      ctx.lineWidth   = 1.4
      ctx.lineCap     = 'round'
      ctx.stroke()
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

      const scale = Math.min(width / SHIRT_W, height / SHIRT_H) * 0.78
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

      if (!isInShirt(x, y)) {
        setInside(false)
        lastPosRef.current = null
        return
      }
      setInside(true)

      if (!lastPosRef.current) {
        lastPosRef.current = { x, y }
        return
      }

      const dx   = x - lastPosRef.current.x
      const dy   = y - lastPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      distAccRef.current += dist

      /* perpendicular to direction of travel + tiny random jitter */
      const angle = Math.atan2(dy, dx) + Math.PI / 2 + (Math.random() - 0.5) * 0.28

      while (distAccRef.current >= STITCH_GAP) {
        stitchesRef.current.push({ x, y, angle, progress: 0 })
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
    setInside(false)
    lastPosRef.current = null
    distAccRef.current = 0
  }, [])

  /* ── reset ───────────────────────────────────────────── */
  const reset = useCallback(() => {
    stitchesRef.current = []
    setCount(0)
    draw()
  }, [draw])

  return (
    <div className="jpage">
      <Nav />

      <div className="jlayout">

        {/* ── LEFT ── */}
        <div className="jleft">
          <div className="jleft-top">
            <span className="jeyebrow">The Journal</span>
            <h1 className="jtitle">
              The<br />Stitch<br />Index
            </h1>
            <p className="jdesc">
              Move your cursor over the shirt.<br />
              Every thread is a thought.
            </p>
          </div>

          <div className="jcounter">
            <span className="jcount-num">{String(count).padStart(4, '0')}</span>
            <span className="jcount-label">Stitches Applied</span>
          </div>

          <nav className="jarticles" aria-label="Articles">
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

        {/* ── RIGHT — interactive canvas ── */}
        <div className="jright" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="jcanvas"
            style={{ cursor: inside ? 'crosshair' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          {count === 0 && (
            <div className="jhint" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Hover the shirt to stitch
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
