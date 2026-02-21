import Link from 'next/link'
import RevealOnScroll from './RevealOnScroll'

export default function CTA() {
  return (
    <section className="cta-section section" id="contact">
      <div className="container">
        <RevealOnScroll>
          <p className="label cta-label">Ready?</p>
        </RevealOnScroll>
        <RevealOnScroll delay={1}>
          <h2 className="headline-lg cta-title">
            Let&apos;s Build Something
            <br />
            Worth Wearing
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={2}>
          <p className="body-lg cta-subtitle">
            Your brand deserves more than a logo on a blank. Let&apos;s create
            apparel that tells your story.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={3}>
          <Link href="mailto:studio@atelier.com" className="cta-button">
            <span>Start a Conversation</span>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  )
}
