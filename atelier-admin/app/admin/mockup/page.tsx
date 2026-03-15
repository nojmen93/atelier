'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PRODUCT_TEMPLATES = {
  tshirt: {
    name: 'T-Shirt',
    variants: [
      {
        id: 'tshirt-black-front',
        name: 'Black - Front',
        color: 'Black',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90',
        printZone: { x: 32, y: 25, width: 36, height: 35 },
        perspective: { skewX: 0, skewY: 0, curve: 0.02 },
        blendMode: 'multiply' as const,
        opacity: 0.9,
      },
      {
        id: 'tshirt-white-front',
        name: 'White - Front',
        color: 'White',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1200&q=90',
        printZone: { x: 30, y: 22, width: 40, height: 38 },
        perspective: { skewX: 0, skewY: 0, curve: 0.02 },
        blendMode: 'multiply' as const,
        opacity: 0.85,
      },
      {
        id: 'tshirt-gray-front',
        name: 'Gray - Front',
        color: 'Gray',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=90',
        printZone: { x: 28, y: 20, width: 44, height: 42 },
        perspective: { skewX: 0, skewY: 0, curve: 0.015 },
        blendMode: 'multiply' as const,
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
        blendMode: 'screen' as const,
        opacity: 0.95,
      },
      {
        id: 'cap-white-front',
        name: 'White - Front',
        color: 'White',
        image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=1200&q=90',
        printZone: { x: 28, y: 32, width: 44, height: 22 },
        perspective: { skewX: 0, skewY: -2, curve: 0.04 },
        blendMode: 'multiply' as const,
        opacity: 0.9,
      },
    ],
  },
} as const

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

interface Logo {
  id: string
  company_name: string
  file_url: string
  file_format: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}

const SWATCH_COLORS: Record<string, string> = {
  White: '#f5f5f5',
  Black: '#0a0a0a',
  Gray: '#6b6b6b',
}

export default function MockupGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const productImageRef = useRef<HTMLImageElement | null>(null)
  const logoImageRef = useRef<HTMLImageElement | null>(null)
  const renderIdRef = useRef(0)

  const [isLoading, setIsLoading] = useState(true)
  const [productType, setProductType] = useState<ProductType>('tshirt')
  const [selectedVariant, setSelectedVariant] = useState<Variant>(PRODUCT_TEMPLATES.tshirt.variants[0])
  const [logoScale, setLogoScale] = useState(0.7)
  const [logoOffsetX, setLogoOffsetX] = useState(0)
  const [logoOffsetY, setLogoOffsetY] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // Logo source: library or upload
  const [logoSource, setLogoSource] = useState<'library' | 'upload'>('library')
  const [logos, setLogos] = useState<Logo[]>([])
  const [selectedLogoId, setSelectedLogoId] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch logos from library
  useEffect(() => {
    async function fetchLogos() {
      const { data } = await supabase
        .from('logos')
        .select('id, company_name, file_url, file_format')
        .order('company_name')
      setLogos((data || []) as Logo[])
    }
    fetchLogos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When selecting from library, set preview URL
  useEffect(() => {
    if (logoSource === 'library' && selectedLogoId) {
      const logo = logos.find((l) => l.id === selectedLogoId)
      if (logo) {
        setLogoPreview(logo.file_url)
      }
    }
  }, [logoSource, selectedLogoId, logos])

  // Load logo image when preview URL changes
  useEffect(() => {
    if (!logoPreview) {
      logoImageRef.current = null
      return
    }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      logoImageRef.current = img
    }
    img.src = logoPreview
  }, [logoPreview])

  const renderMockup = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderId = ++renderIdRef.current
    setIsLoading(true)

    try {
      const productImg = await loadImage(selectedVariant.image)
      if (renderIdRef.current !== renderId) return

      productImageRef.current = productImg

      const maxWidth = 800
      const scale = maxWidth / productImg.width
      canvas.width = maxWidth
      canvas.height = productImg.height * scale

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height)

      if (logoImageRef.current && logoPreview) {
        const logo = logoImageRef.current
        const zone = selectedVariant.printZone
        const perspective = selectedVariant.perspective

        const zoneX = (zone.x / 100) * canvas.width
        const zoneY = (zone.y / 100) * canvas.height
        const zoneWidth = (zone.width / 100) * canvas.width
        const zoneHeight = (zone.height / 100) * canvas.height

        const logoAspect = logo.width / logo.height
        let logoWidth = zoneWidth * logoScale
        let logoHeight = logoWidth / logoAspect

        if (logoHeight > zoneHeight * logoScale) {
          logoHeight = zoneHeight * logoScale
          logoWidth = logoHeight * logoAspect
        }

        const logoX = zoneX + (zoneWidth - logoWidth) / 2 + (logoOffsetX * zoneWidth * 0.01)
        const logoY = zoneY + (zoneHeight - logoHeight) / 2 + (logoOffsetY * zoneHeight * 0.01)

        const isDark = ['Black', 'Navy', 'Dark'].some((c) =>
          selectedVariant.color.toLowerCase().includes(c.toLowerCase())
        )

        // Main logo with blend mode
        ctx.save()
        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply'
        ctx.globalAlpha = selectedVariant.opacity

        ctx.translate(logoX + logoWidth / 2, logoY + logoHeight / 2)
        const skewMatrix = new DOMMatrix([
          1, Math.tan(perspective.skewY * Math.PI / 180),
          Math.tan(perspective.skewX * Math.PI / 180), 1,
          0, 0,
        ])
        ctx.transform(skewMatrix.a, skewMatrix.b, skewMatrix.c, skewMatrix.d, 0, 0)
        ctx.translate(-(logoX + logoWidth / 2), -(logoY + logoHeight / 2))

        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)

        // Fabric texture noise overlay
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.08
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
        ctx.restore()

        // Definition pass
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
  }, [selectedVariant, logoPreview, logoScale, logoOffsetX, logoOffsetY])

  useEffect(() => {
    renderMockup()
  }, [renderMockup])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      setLogoPreview(url)
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { logoImageRef.current = img }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const handleProductTypeChange = (type: ProductType) => {
    setProductType(type)
    setSelectedVariant(PRODUCT_TEMPLATES[type].variants[0])
  }

  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas || !productImageRef.current) return

    setIsExporting(true)
    try {
      const exportCanvas = document.createElement('canvas')
      const productImg = productImageRef.current
      exportCanvas.width = productImg.width
      exportCanvas.height = productImg.height

      const ctx = exportCanvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(productImg, 0, 0)

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

        const isDark = ['Black', 'Navy', 'Dark'].some((c) =>
          selectedVariant.color.toLowerCase().includes(c.toLowerCase())
        )

        ctx.save()
        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply'
        ctx.globalAlpha = selectedVariant.opacity

        ctx.translate(logoX + logoWidth / 2, logoY + logoHeight / 2)
        const skewMatrix = new DOMMatrix([
          1, Math.tan(perspective.skewY * Math.PI / 180),
          Math.tan(perspective.skewX * Math.PI / 180), 1,
          0, 0,
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

      // Upload to Supabase + download
      const dataUrl = exportCanvas.toDataURL('image/png', 1.0)

      const link = document.createElement('a')
      link.download = `mockup-${selectedVariant.id}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      // Also upload to storage
      const blob = await (await fetch(dataUrl)).blob()
      const fileName = `mockups/generator/${crypto.randomUUID()}.png`
      await supabase.storage
        .from('product-images')
        .upload(fileName, blob, { contentType: 'image/png', upsert: false })
    } finally {
      setIsExporting(false)
    }
  }

  const clearLogo = () => {
    setLogoPreview(null)
    setSelectedLogoId('')
    logoImageRef.current = null
  }

  const product = PRODUCT_TEMPLATES[productType]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mockup Generator</h1>
          <p className="text-neutral-500 text-sm mt-1">Preview logos on product templates with realistic rendering</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || !logoPreview}
            className="px-5 py-2.5 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        {/* Canvas viewport */}
        <div>
          <div className="relative border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
            <div className="flex items-center justify-center p-4">
              <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <div className="w-8 h-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                <span className="text-neutral-400 text-sm mt-3">Loading product...</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-xs text-neutral-300">
              {selectedVariant.name}
            </div>
          </div>

          {/* Print zone info */}
          {logoPreview && (
            <p className="text-xs text-neutral-600 mt-2">
              Print zone: {selectedVariant.printZone.width}% x {selectedVariant.printZone.height}% &middot; Blend: {selectedVariant.color.toLowerCase().includes('black') ? 'screen' : 'multiply'}
            </p>
          )}
        </div>

        {/* Controls panel */}
        <div className="space-y-6">
          {/* Product Type */}
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Product Type</h3>
            <div className="flex gap-2">
              {(Object.keys(PRODUCT_TEMPLATES) as ProductType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleProductTypeChange(type)}
                  className={`flex-1 px-3 py-2.5 text-sm rounded border transition ${
                    productType === type
                      ? 'border-white bg-white text-black font-medium'
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  {PRODUCT_TEMPLATES[type].name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Variant */}
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Color Variant</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded border text-sm transition ${
                    selectedVariant.id === variant.id
                      ? 'border-white bg-neutral-900 text-white'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-600 shrink-0"
                    style={{ backgroundColor: SWATCH_COLORS[variant.color] || '#ccc' }}
                  />
                  {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Source */}
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Logo</h3>

            {/* Source toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-neutral-900 rounded">
              <button
                onClick={() => setLogoSource('library')}
                className={`flex-1 px-3 py-1.5 text-xs rounded transition ${
                  logoSource === 'library' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Logo Library
              </button>
              <button
                onClick={() => setLogoSource('upload')}
                className={`flex-1 px-3 py-1.5 text-xs rounded transition ${
                  logoSource === 'upload' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Upload File
              </button>
            </div>

            {logoSource === 'library' ? (
              logos.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No logos in library.{' '}
                  <Link href="/admin/logos/new" className="text-neutral-300 underline hover:text-white">Upload one</Link>
                </p>
              ) : (
                <select
                  value={selectedLogoId}
                  onChange={(e) => setSelectedLogoId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
                >
                  <option value="">Select a logo...</option>
                  {logos.map((logo) => (
                    <option key={logo.id} value={logo.id}>
                      {logo.company_name} ({logo.file_format})
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div>
                {logoPreview && logoSource === 'upload' ? (
                  <div className="relative border border-neutral-800 rounded-lg p-4 bg-neutral-900 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-h-20 max-w-full object-contain" />
                    <button
                      onClick={clearLogo}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-white bg-neutral-800 rounded transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 px-4 py-6 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-500 transition">
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-sm text-neutral-400">Upload Logo</span>
                    <span className="text-xs text-neutral-600">PNG with transparency works best</span>
                  </label>
                )}
              </div>
            )}

            {logoPreview && (
              <button
                onClick={clearLogo}
                className="mt-2 text-xs text-neutral-500 hover:text-neutral-300 transition"
              >
                Clear logo
              </button>
            )}
          </div>

          {/* Logo adjustments */}
          {logoPreview && (
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Adjust Placement</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-400">Size</span>
                    <span className="text-neutral-500 tabular-nums">{Math.round(logoScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.02"
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-400">Horizontal</span>
                    <span className="text-neutral-500 tabular-nums">{logoOffsetX > 0 ? '+' : ''}{logoOffsetX.toFixed(0)}</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={logoOffsetX}
                    onChange={(e) => setLogoOffsetX(parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-400">Vertical</span>
                    <span className="text-neutral-500 tabular-nums">{logoOffsetY > 0 ? '+' : ''}{logoOffsetY.toFixed(0)}</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={logoOffsetY}
                    onChange={(e) => setLogoOffsetY(parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setLogoScale(0.7)
                    setLogoOffsetX(0)
                    setLogoOffsetY(0)
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                  Reset Position
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/50">
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Tips</h3>
            <ul className="space-y-1.5 text-xs text-neutral-500">
              <li>PNG with transparent background gives cleanest results</li>
              <li>Light logos work better on dark products (and vice versa)</li>
              <li>Exported PNGs are full resolution for print-ready quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
