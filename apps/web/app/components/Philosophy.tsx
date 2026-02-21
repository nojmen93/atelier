import Image from 'next/image'
import RevealOnScroll from './RevealOnScroll'

export default function Philosophy() {
  return (
    <section className="philosophy section" id="philosophy">
      <div className="container">
        <div className="philosophy-grid">
          <div className="philosophy-content">
            <RevealOnScroll>
              <p className="label philosophy-label">The Philosophy</p>
            </RevealOnScroll>
            <RevealOnScroll delay={1}>
              <h2 className="headline-lg philosophy-title">Not a Print Shop.</h2>
            </RevealOnScroll>
            <RevealOnScroll delay={2}>
              <p className="body-lg philosophy-text">
                We&apos;re a brand-building apparel studio. Every thread, every
                stitch, every detail is a deliberate choice. We transform
                corporate wear into statement pieces. Merch into movements.
                Uniforms into culture.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={3}>
              <p className="body-lg philosophy-text" style={{ marginTop: '1.5rem' }}>
                Your team deserves to wear something they&apos;re proud of. Your
                brand deserves to be remembered.
              </p>
            </RevealOnScroll>
          </div>
          <RevealOnScroll className="philosophy-visual">
            <Image
              src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80"
              alt="Premium apparel detail"
              fill
              className="philosophy-image"
            />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}
