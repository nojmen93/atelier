'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  onOpenQuote?: () => void
}

export default function Nav({ onOpenQuote }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <Link href="/" className="logo">
              ATELIER
            </Link>

            <ul className="nav-links">
              <li>
                <Link href="/collection">Collection</Link>
              </li>
              <li>
                <Link href="/journal">Journal</Link>
              </li>
              <li>
                <a href="mailto:studio@atelier.com">Contact</a>
              </li>
            </ul>

            <button
              className="nav-cta"
              onClick={onOpenQuote}
              type="button"
            >
              Get a Quote
            </button>

            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen ? ' active' : ''}`}>
        <button
          className="mobile-close"
          onClick={closeMobile}
          aria-label="Close menu"
          type="button"
        />
        <ul className="mobile-menu-links">
          <li>
            <Link href="/collection" onClick={closeMobile}>Collection</Link>
          </li>
          <li>
            <Link href="/journal" onClick={closeMobile}>Journal</Link>
          </li>
          <li>
            <a href="mailto:studio@atelier.com" onClick={closeMobile}>Contact</a>
          </li>
          <li>
            <button
              type="button"
              onClick={() => { closeMobile(); onOpenQuote?.() }}
            >
              Get a Quote
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
