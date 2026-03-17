'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  onOpenQuote?: () => void
}

export default function Nav({ onOpenQuote }: Props) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">ATELIER</Link>

        <div className="nav-right">
          <ul className="nav-links">
            <li><Link href="/collection">Collection</Link></li>
            <li><a href="mailto:studio@atelier.com">Contact</a></li>
          </ul>
          <button className="nav-cta" onClick={onOpenQuote} type="button">
            Get a Quote
          </button>
        </div>

        <button
          className={`nav-hamburger${open ? ' open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`nav-mobile-menu${open ? ' open' : ''}`}>
        <Link href="/collection" onClick={close}>Collection</Link>
        <a href="mailto:studio@atelier.com" onClick={close}>Contact</a>
        <button type="button" onClick={() => { close(); onOpenQuote?.() }}>
          Get a Quote
        </button>
      </div>
    </>
  )
}
