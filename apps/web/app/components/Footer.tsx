import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <span className="site-footer-brand">Atelier</span>
      <ul className="site-footer-links">
        <li><Link href="/collection">Collection</Link></li>
        <li><a href="mailto:studio@atelier.com">Contact</a></li>
      </ul>
      <span className="site-footer-copy">
        &copy; {new Date().getFullYear()} Atelier Studio
      </span>
    </footer>
  )
}
