'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navLinks = [
    { href: '#philosophy', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Work' },
    { href: '/journal', label: 'Journal' },
    { href: '#process', label: 'Process' },
  ]

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-inner">
            <Link href="/" className="logo">
              ATELIER
            </Link>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <Link href="/design" className="nav-cta">
              Design Yours
            </Link>
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'active' : ''}`}>
        <button
          className="mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
        <ul className="mobile-menu-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="#contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </>
  )
}
