'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { type Product, type ProductColour } from './ProductCard'

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
  onQuote: (name: string, selectedColour: ProductColour | null) => void
}

export default function ProductModal({ open, product, onClose, onQuote }: Props) {
  const [imgIndex, setImgIndex] = useState(0)
  const [selectedColour, setSelectedColour] = useState<ProductColour | null>(null)

  useEffect(() => {
    setImgIndex(0)
    setSelectedColour(null)
  }, [product])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !product) return null

  const name = product.display_name || product.name
  const images = product.images?.filter(Boolean) ?? []
  const currentImg = images[imgIndex] ?? null
  const hasMultiple = images.length > 1
  const colours = product.colours ?? []

  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIndex(i => (i + 1) % images.length)

  return (
    <div className="pmodal-overlay" onClick={onClose} style={{ pointerEvents: 'auto' }}>
      <div className="pmodal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={name}>
        <button className="pmodal-close" onClick={onClose} aria-label="Close" style={{ pointerEvents: 'auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image column */}
        <div className="pmodal-img-col">
          <div className="pmodal-img-wrap">
            {currentImg ? (
              <Image
                src={currentImg}
                alt={name}
                fill
                className="pmodal-img"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
            )}
          </div>

          {hasMultiple && (
            <div className="pmodal-gallery-nav">
              <button className="pmodal-gallery-arrow" onClick={prev} aria-label="Previous image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="pmodal-gallery-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`pmodal-gallery-dot${i === imgIndex ? ' active' : ''}`}
                    onClick={() => setImgIndex(i)}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
              <button className="pmodal-gallery-arrow" onClick={next} aria-label="Next image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="pmodal-info-col">
          {product.categories?.name && (
            <span className="pmodal-category">{product.categories.name}</span>
          )}
          <h2 className="pmodal-name">{name}</h2>
          <div className="pmodal-divider" />

          {product.material && (
            <>
              <p className="pmodal-label">Material</p>
              <p className="pmodal-spec">{product.material}</p>
            </>
          )}

          {product.description && (
            <>
              <p className="pmodal-label">About</p>
              <p className="pmodal-spec">{product.description}</p>
            </>
          )}

          {colours.length > 0 && (
            <div className="pmodal-colours">
              <p className="pmodal-label">
                Available Colours
                {selectedColour && (
                  <span className="pmodal-colour-selected-name"> — {selectedColour.colour_name}</span>
                )}
              </p>
              <div className="pmodal-colour-swatches">
                {colours.map((c) => (
                  <button
                    key={c.colour_name}
                    type="button"
                    className={`pmodal-swatch${selectedColour?.colour_name === c.colour_name ? ' selected' : ''}`}
                    style={{ background: c.hex_value || '#888' }}
                    onClick={() => setSelectedColour(prev => prev?.colour_name === c.colour_name ? null : c)}
                    aria-label={c.colour_name}
                    title={c.colour_name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pmodal-cta">
            <button
              className="pmodal-cta-btn"
              type="button"
              style={{ pointerEvents: 'auto' }}
              onClick={() => { onClose(); onQuote(name, selectedColour) }}
            >
              Get a Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
