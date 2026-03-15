export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grain" />
        <div className="hero-glow" />
      </div>

      <div className="container hero-container">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-line" />
          <span>Premium Custom Apparel</span>
        </div>

        <h1 className="hero-headline">
          <span className="hero-headline-line">Clothes That</span>
          <br />
          <span className="hero-headline-accent">Build Brands</span>
        </h1>

        <p className="hero-sub">
          We craft premium branded apparel for companies that refuse to blend in.
          Embroidery, screen print, and everything between — done right.
        </p>

        <div className="hero-actions">
          <a href="#quote" className="btn btn--primary">
            Request a Quote
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#products" className="btn btn--ghost">
            View Products
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">500+</span>
            <span className="hero-stat-label">Brands Served</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">12+</span>
            <span className="hero-stat-label">Years Experience</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">100%</span>
            <span className="hero-stat-label">Quality Guaranteed</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
