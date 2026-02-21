'use client'

import { useState } from 'react'
import Image from 'next/image'

interface QuoteGalleryProps {
  images: string[]
  productName: string
}

export default function QuoteGallery({ images, productName }: QuoteGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="quote-gallery">
      <div className="quote-gallery-main">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - View ${activeIndex + 1}`}
          fill
          className="quote-gallery-image"
        />
      </div>
      
      {images.length > 1 && (
        <div className="quote-gallery-thumbs">
          {images.map((image, index) => (
            <button
              key={index}
              className={`quote-gallery-thumb ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="quote-gallery-thumb-image"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
