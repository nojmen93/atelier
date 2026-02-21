import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <Image
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
          alt="Fashion apparel"
          fill
          priority
          className="hero-bg-image"
        />
      </div>
      <div className="container">
        <div className="hero-content">
          <p className="label hero-label">Custom Apparel Studio</p>
          <h1 className="headline-xl hero-title">
            Your Brand.
            <br />
            Worn.
          </h1>
          <p className="body-lg hero-subtitle">
            We don&apos;t print clothes. We build identities. Premium custom
            apparel for brands that refuse to blend in.
          </p>
          <Link href="/design" className="hero-cta">
            <span>Design Your Own</span>
            <span className="hero-cta-line" />
          </Link>
        </div>
      </div>
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
