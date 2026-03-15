'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// Product templates with print zone definitions
// Print zone coordinates are percentages of the image dimensions
const PRODUCT_TEMPLATES = {
  tshirt: {
    name: 'T-Shirt',
    variants: [
      {
        id: 'tshirt-black-front',
        name: 'Black - Front',
        color: 'Black',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90',
        // Print zone as percentage of image [x, y, width, height]
        printZone: { x: 32, y: 25, width: 36, height: 35 },
        // Perspective transform points
        perspective: {
          skewX: 0,
          skewY: 0,
          curve: 0.02,
        },
        blendMode: 'multiply',
        opacity: 0.9,
      },
      {
        id: 'tshirt-white-front',
        name: 'White - Front',
        color: 'White',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1200&q=90',
        printZone: { x: 30, y: 22, width: 40, height: 38 },
        perspective: { skewX: 0, skewY: 0, curve: 0.02 },
        blendMode: 'multiply',
        opacity: 0.85,
      },
      {
        id: 'tshirt-gray-front',
        name: 'Gray - Front',
        color: 'Gray',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=90',
        printZone: { x: 28, y: 20, width: 44, height: 42 },
        perspective: { skewX: 0, skewY: 0, curve: 0.015 },
        blendMode: 'multiply',
        opacity: 0.88,
      },
    ],
  },
  cap: {
    name: 'Cap',
    variants: [
      {
        id: 'cap-black-front',
        name: 'Black - Front',
        color: 'Black',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&q=90',
        printZone: { x: 25, y: 35, width: 50, height: 20 },
        perspective: { skewX: 0, skewY: -2, curve: 0.05 },
        blendMode: 'screen',
        opacity: 0.95,
      },
      {
        id: 'cap-white-front',
        name: 'White - Front',
        color: 'White',
        image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=1200&q=90',
        printZone: { x: 28, y: 32, width: 44, height: 22 },
        perspective: { skewX: 0, skewY: -2, curve: 0.04 },
        blendMode: 'multiply',
        opacity: 0.9,
      },
    ],
  },
}

type ProductType = keyof typeof PRODUCT_TEMPLATES

interface Variant {
  id: string
  name: string
  color: string
  image: string
  printZone: { x: number; y: number; width: number; height: number }
  perspective: { skewX: number; skewY: number; curve: number }
  blendMode: string
  opacity: number
}

export default function MockupGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const productImageRef = useRef<HTMLImageElement | null>(null)
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [productType, setProductType] = useState<ProductType>('tshirt')
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    PRODUCT_TEMPLATES.tshirt.variants[0]
  )
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoScale, setLogoScale] = useState(0.7)
  const [logoOffsetX, setLogoOffsetX] = useState(0)
  const [logoOffsetY, setLogoOffsetY] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // Load product image
  const loadProductImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }, [])

  // Render mockup
  const renderMockup = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsLoading(true)

    try {
      // Load product image
      const productImg = await loadProductImage(selectedVariant.image)
      productImageRef.current = productImg

      // Set canvas size
      const maxWidth = 800
      const scale = maxWidth / productImg.width
      canvas.width = maxWidth
      canvas.height = productImg.height * scale

      // Clear and draw product
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height)

      // Draw logo if exists
      if (logoImageRef.current && logoPreview) {
        const logo = logoImageRef.current
        const zone = selectedVariant.printZone
        const perspective = selectedVariant.perspective

        // Calculate print zone in pixels
        const zoneX = (zone.x / 100) * canvas.width
        const zoneY = (zone.y / 100) * canvas.height
        const zoneWidth = (zone.width / 100) * canvas.width
        const zoneHeight = (zone.height / 100) * canvas.height

        // Calculate logo dimensions maintaining aspect ratio
        const logoAspect = logo.width / logo.height
        let logoWidth = zoneWidth * logoScale
        let logoHeight = logoWidth / logoAspect

        if (logoHeight > zoneHeight * logoScale) {
          logoHeight = zoneHeight * logoScale
          logoWidth = logoHeight * logoAspect
        }

        // Center logo in print zone with offset
        const logoX = zoneX + (zoneWidth - logoWidth) / 2 + (logoOffsetX * zoneWidth * 0.01)
        const logoY = zoneY + (zoneHeight - logoHeight) / 2 + (logoOffsetY * zoneHeight * 0.01)

        // Save context state
        ctx.save()

        // Apply blend mode based on product color
        const isDark = ['Black', 'Navy', 'Dark'].some(c => 
          selectedVariant.color.toLowerCase().includes(c.toLowerCase())
        )
        
        // Set composite operation for realistic blending
        if (isDark) {
          ctx.globalCompositeOperation = 'screen'
          ctx.globalAlpha = selectedVariant.opacity
        } else {
          ctx.globalCompositeOperation = 'multiply'
          ctx.globalAlpha = selectedVariant.opacity
        }

        // Apply subtle perspective transform
        ctx.translate(logoX + logoWidth / 2, logoY + logoHeight / 2)
        
        // Apply skew for perspective
        const skewMatrix = new DOMMatrix([
          1, Math.tan(perspective.skewY * Math.PI / 180),
          Math.tan(perspective.skewX * Math.PI / 180), 1,
          0, 0
        ])
        ctx.transform(
          skewMatrix.a, skewMatrix.b,
          skewMatrix.c, skewMatrix.d,
          skewMatrix.e, skewMatrix.f
        )
        
        ctx.translate(-(logoX + logoWidth / 2), -(logoY + logoHeight / 2))

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)

        // Add subtle fabric texture overlay for realism
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.08
        
        // Create noise pattern for fabric texture
        const noiseCanvas = document.createElement('canvas')
        noiseCanvas.width = logoWidth
        noiseCanvas.height = logoHeight
        const noiseCtx = noiseCanvas.getContext('2d')
        if (noiseCtx) {
          const imageData = noiseCtx.createImageData(logoWidth, logoHeight)
          for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 50
            imageData.data[i] = noise
            imageData.data[i + 1] = noise
            imageData.data[i + 2] = noise
            imageData.data[i + 3] = 255
          }
          noiseCtx.putImageData(imageData, 0, 0)
          ctx.drawImage(noiseCanvas, logoX, logoY, logoWidth, logoHeight)
        }

        // Restore context
        ctx.restore()

        // Draw the logo again with normal blend for definition
        ctx.save()
        ctx.globalAlpha = isDark ? 0.15 : 0.1
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        ctx.restore()
      }
    } catch (error) {
      console.error('Error rendering mockup:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVariant, logoPreview, logoScale, logoOffsetX, logoOffsetY, loadProductImage])

  // Initial render and re-render on changes
  useEffect(() => {
    renderMockup()
  }, [renderMockup])

  // Load logo image when file changes
  useEffect(() => {
    if (!logoPreview) {
      logoImageRef.current = null
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      logoImageRef.current = img
      renderMockup()
    }
    img.src = logoPreview
  }, [logoPreview, renderMockup])

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle product type change
  const handleProductTypeChange = (type: ProductType) => {
    setProductType(type)
    setSelectedVariant(PRODUCT_TEMPLATES[type].variants[0])
  }

  // Export high-res image
  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas || !productImageRef.current) return

    setIsExporting(true)

    try {
      // Create high-res canvas
      const exportCanvas = document.createElement('canvas')
      const productImg = productImageRef.current
      exportCanvas.width = productImg.width
      exportCanvas.height = productImg.height

      const ctx = exportCanvas.getContext('2d')
      if (!ctx) return

      // Draw product at full resolution
      ctx.drawImage(productImg, 0, 0)

      // Draw logo at full resolution if exists
      if (logoImageRef.current && logoPreview) {
        const logo = logoImageRef.current
        const zone = selectedVariant.printZone
        const perspective = selectedVariant.perspective

        const zoneX = (zone.x / 100) * exportCanvas.width
        const zoneY = (zone.y / 100) * exportCanvas.height
        const zoneWidth = (zone.width / 100) * exportCanvas.width
        const zoneHeight = (zone.height / 100) * exportCanvas.height

        const logoAspect = logo.width / logo.height
        let logoWidth = zoneWidth * logoScale
        let logoHeight = logoWidth / logoAspect

        if (logoHeight > zoneHeight * logoScale) {
          logoHeight = zoneHeight * logoScale
          logoWidth = logoHeight * logoAspect
        }

        const logoX = zoneX + (zoneWidth - logoWidth) / 2 + (logoOffsetX * zoneWidth * 0.01)
        const logoY = zoneY + (zoneHeight - logoHeight) / 2 + (logoOffsetY * zoneHeight * 0.01)

        const isDark = ['Black', 'Navy', 'Dark'].some(c => 
          selectedVariant.color.toLowerCase().includes(c.toLowerCase())
        )

        ctx.save()
        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply'
        ctx.globalAlpha = selectedVariant.opacity

        ctx.translate(logoX + logoWidth / 2, logoY + logoHeight / 2)
        const skewMatrix = new DOMMatrix([
          1, Math.tan(perspective.skewY * Math.PI / 180),
          Math.tan(perspective.skewX * Math.PI / 180), 1,
          0, 0
        ])
        ctx.transform(skewMatrix.a, skewMatrix.b, skewMatrix.c, skewMatrix.d, 0, 0)
        ctx.translate(-(logoX + logoWidth / 2), -(logoY + logoHeight / 2))

        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = isDark ? 0.15 : 0.1
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        ctx.restore()
      }

      // Download
      const link = document.createElement('a')
      link.download = `mockup-${selectedVariant.id}-${Date.now()}.png`
      link.href = exportCanvas.toDataURL('image/png', 1.0)
      link.click()
    } finally {
      setIsExporting(false)
    }
  }

  // Copy to clipboard as base64 (for use in quotes)
  const handleCopyForQuote = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL('image/png', 0.9)
      await navigator.clipboard.writeText(dataUrl)
      alert('Mockup copied to clipboard! You can paste this in Sanity Studio.')
    } catch {
      // Fallback: download instead
      handleExport()
    }
  }

  const product = PRODUCT_TEMPLATES[productType]

  return (
    <div className="admin-mockup">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Admin
          </Link>
          <h1>Mockup Generator</h1>
          <div className="admin-header-actions">
            <button
              className="admin-btn admin-btn--secondary"
              onClick={handleExport}
              disabled={isExporting || !logoPreview}
            >
              {isExporting ? 'Exporting...' : 'Export PNG'}
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleCopyForQuote}
              disabled={!logoPreview}
            >
              Save for Quote
            </button>
          </div>
        </div>
      </header>

      <div className="admin-mockup-layout">
        {/* Preview */}
        <div className="admin-viewport">
          <div className="mockup-canvas-wrapper">
            <canvas ref={canvasRef} className="mockup-canvas" />
            {isLoading && (
              <div className="mockup-loading">
                <div className="mockup-spinner" />
                <span>Loading product...</span>
              </div>
            )}
          </div>
          <div className="viewport-info">
            <span className="variant-badge">{selectedVariant.name}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-controls">
          {/* Product Type */}
          <div className="control-section">
            <h3 className="control-section-title">Product Type</h3>
            <div className="product-selector">
              {(Object.keys(PRODUCT_TEMPLATES) as ProductType[]).map((type) => (
                <button
                  key={type}
                  className={`product-option ${productType === type ? 'active' : ''}`}
                  onClick={() => handleProductTypeChange(type)}
                >
                  {PRODUCT_TEMPLATES[type].name}
                </button>
              ))}
            </div>
          </div>

          {/* Variant Selection */}
          <div className="control-section">
            <h3 className="control-section-title">Color Variant</h3>
            <div className="variant-grid">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  className={`variant-option ${selectedVariant.id === variant.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div 
                    className="variant-swatch" 
                    style={{ 
                      backgroundColor: 
                        variant.color === 'White' ? '#f5f5f5' :
                        variant.color === 'Black' ? '#0a0a0a' :
                        variant.color === 'Gray' ? '#6b6b6b' :
                        variant.color === 'Natural' ? '#e8e0d5' :
                        '#ccc'
                    }} 
                  />
                  <span>{variant.color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="control-section">
            <h3 className="control-section-title">Client Logo</h3>
            <div className="logo-upload-area">
              {logoPreview ? (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                  <button
                    className="logo-remove"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="logo-dropzone">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Upload Logo</span>
                  <span className="dropzone-hint">PNG with transparency works best</span>
                </label>
              )}
            </div>
          </div>

          {/* Logo Adjustments */}
          {logoPreview && (
            <div className="control-section">
              <h3 className="control-section-title">Adjust Placement</h3>

              <div className="slider-control">
                <label>
                  <span>Size</span>
                  <span>{Math.round(logoScale * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.02"
                  value={logoScale}
                  onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-control">
                <label>
                  <span>Horizontal</span>
                  <span>{logoOffsetX > 0 ? '+' : ''}{logoOffsetX.toFixed(0)}</span>
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={logoOffsetX}
                  onChange={(e) => setLogoOffsetX(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-control">
                <label>
                  <span>Vertical</span>
                  <span>{logoOffsetY > 0 ? '+' : ''}{logoOffsetY.toFixed(0)}</span>
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={logoOffsetY}
                  onChange={(e) => setLogoOffsetY(parseFloat(e.target.value))}
                />
              </div>

              <button
                className="reset-btn"
                onClick={() => {
                  setLogoScale(0.7)
                  setLogoOffsetX(0)
                  setLogoOffsetY(0)
                }}
              >
                Reset Position
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="control-section control-section--tips">
            <h3 className="control-section-title">Pro Tips</h3>
            <ul className="tips-list">
              <li>PNG with transparent background gives cleanest results</li>
              <li>Light logos work better on dark products (and vice versa)</li>
              <li>Exported PNGs are full resolution for print-ready quality</li>
              <li>Use "Save for Quote" to add mockup to client proposal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
