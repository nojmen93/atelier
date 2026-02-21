import Link from 'next/link'

const navLinks = [
  { href: '#philosophy', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#portfolio', label: 'Work' },
  { href: '/journal', label: 'Journal' },
  { href: '#process', label: 'Process' },
]

const contactInfo = [
  { href: 'mailto:studio@atelier.com', label: 'studio@atelier.com' },
  { href: 'tel:+46701234567', label: '+46 70 123 45 67' },
  { href: null, label: 'Stockholm, Sweden' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">ATELIER</div>
            <p className="footer-tagline">
              A brand-building apparel studio crafting premium custom clothing
              for forward-thinking companies.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links">
              {contactInfo.map((item, index) =>
                item.href ? (
                  <li key={index}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ) : (
                  <li key={index}>{item.label}</li>
                )
              )}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Follow</h4>
            <div className="footer-social">
              <Link href="#" aria-label="Instagram">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="18" cy="6" r="1" />
                </svg>
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
              <Link href="#" aria-label="Behance">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Atelier Studio. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
