'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// Cap color options
const CAP_COLORS = [
  { name: 'Black', value: '#0a0a0a' },
  { name: 'Off-White', value: '#f5f5f3' },
  { name: 'Navy', value: '#1a2744' },
  { name: 'Forest', value: '#2d4a3e' },
  { name: 'Burgundy', value: '#722f37' },
  { name: 'Stone', value: '#a39e93' },
]

// Text color options
const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#0a0a0a' },
  { name: 'Gold', value: '#c9b99a' },
  { name: 'Silver', value: '#a8a8a8' },
]

// Font options
const FONTS = [
  { name: 'Classic', value: 'Bebas Neue' },
  { name: 'Modern', value: 'Outfit' },
  { name: 'Serif', value: 'Georgia' },
  { name: 'Mono', value: 'monospace' },
]

// Decoration types
const DECORATION_TYPES = [
  { name: 'Embroidery', value: 'embroidery', description: 'Premium thread work' },
  { name: 'Screen Print', value: 'print', description: 'Bold, flat graphics' },
]

export default function DesignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const textRef = useRef<fabric.IText | null>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [capColor, setCapColor] = useState(CAP_COLORS[0].value)
  const [textContent, setTextContent] = useState('YOUR BRAND')
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value)
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value)
  const [decorationType, setDecorationType] = useState(DECORATION_TYPES[0].value)
  const [view, setView] = useState<'front' | 'side'>('front')
  const [quantity, setQuantity] = useState(50)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Initialize Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      const fabric = (await import('fabric')).fabric
      
      if (!canvasRef.current || fabricRef.current) return

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 400,
        backgroundColor: 'transparent',
        selection: false,
      })

      fabricRef.current = canvas

      // Draw cap shape
      drawCap(fabric, canvas, capColor, view)

      // Add default text
      const text = new fabric.IText(textContent, {
        left: 250,
        top: view === 'front' ? 180 : 200,
        fontSize: 32,
        fontFamily: selectedFont,
        fill: textColor,
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        editable: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: false,
        cornerColor: '#c9b99a',
        cornerStyle: 'circle',
        borderColor: '#c9b99a',
        transparentCorners: false,
      })

      canvas.add(text)
      textRef.current = text
      canvas.setActiveObject(text)
      canvas.renderAll()
      
      setIsLoaded(true)
    }

    initFabric()

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [])

  // Draw cap shape
  const drawCap = useCallback(async (fabric: typeof import('fabric').fabric, canvas: fabric.Canvas, color: string, currentView: 'front' | 'side') => {
    // Remove existing cap elements
    const objects = canvas.getObjects()
    objects.forEach((obj) => {
      if (obj.name === 'cap' || obj.name === 'capBrim' || obj.name === 'capButton') {
        canvas.remove(obj)
      }
    })

    if (currentView === 'front') {
      // Front panel (main area)
      const frontPanel = new fabric.Path(
        'M 100 280 Q 100 100 250 80 Q 400 100 400 280 L 400 300 L 100 300 Z',
        {
          fill: color,
          stroke: adjustColor(color, -20),
          strokeWidth: 2,
          selectable: false,
          name: 'cap',
        }
      )

      // Brim
      const brim = new fabric.Ellipse({
        left: 250,
        top: 310,
        rx: 180,
        ry: 35,
        fill: color,
        stroke: adjustColor(color, -30),
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        name: 'capBrim',
      })

      // Top button
      const button = new fabric.Circle({
        left: 250,
        top: 75,
        radius: 8,
        fill: adjustColor(color, -15),
        stroke: adjustColor(color, -30),
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        selectable: false,
        name: 'capButton',
      })

      // Panel seams
      const seam1 = new fabric.Line([175, 85, 175, 280], {
        stroke: adjustColor(color, -15),
        strokeWidth: 1,
        selectable: false,
        name: 'cap',
      })

      const seam2 = new fabric.Line([325, 85, 325, 280], {
        stroke: adjustColor(color, -15),
        strokeWidth: 1,
        selectable: false,
        name: 'cap',
      })

      canvas.add(frontPanel)
      canvas.add(seam1)
      canvas.add(seam2)
      canvas.add(brim)
      canvas.add(button)
    } else {
      // Side view
      const sidePanel = new fabric.Path(
        'M 80 280 Q 80 120 200 100 Q 350 90 420 150 Q 450 200 420 280 L 420 300 L 80 300 Z',
        {
          fill: color,
          stroke: adjustColor(color, -20),
          strokeWidth: 2,
          selectable: false,
          name: 'cap',
        }
      )

      // Side brim
      const sideBrim = new fabric.Path(
        'M 60 300 Q 250 340 440 300 Q 450 320 250 350 Q 50 320 60 300 Z',
        {
          fill: color,
          stroke: adjustColor(color, -30),
          strokeWidth: 2,
          selectable: false,
          name: 'capBrim',
        }
      )

      // Back strap area hint
      const strapHint = new fabric.Path(
        'M 400 200 Q 430 220 420 260',
        {
          fill: 'transparent',
          stroke: adjustColor(color, -25),
          strokeWidth: 3,
          selectable: false,
          name: 'cap',
        }
      )

      canvas.add(sidePanel)
      canvas.add(strapHint)
      canvas.add(sideBrim)
    }

    // Move text to front
    if (textRef.current) {
      canvas.bringToFront(textRef.current)
    }

    canvas.renderAll()
  }, [])

  // Update cap color
  useEffect(() => {
    const updateCap = async () => {
      if (!fabricRef.current || !isLoaded) return
      const fabric = (await import('fabric')).fabric
      drawCap(fabric, fabricRef.current, capColor, view)
    }
    updateCap()
  }, [capColor, view, isLoaded, drawCap])

  // Update text properties
  useEffect(() => {
    if (!textRef.current || !fabricRef.current) return
    
    textRef.current.set({
      fill: textColor,
      fontFamily: selectedFont,
    })
    fabricRef.current.renderAll()
  }, [textColor, selectedFont])

  // Update text content
  const handleTextChange = (value: string) => {
    setTextContent(value)
    if (textRef.current && fabricRef.current) {
      textRef.current.set({ text: value })
      fabricRef.current.renderAll()
    }
  }

  // Toggle view
  const handleViewChange = async (newView: 'front' | 'side') => {
    setView(newView)
    if (textRef.current && fabricRef.current) {
      textRef.current.set({
        top: newView === 'front' ? 180 : 200,
        left: 250,
      })
      fabricRef.current.renderAll()
    }
  }

  // Export design
  const exportDesign = () => {
    if (!fabricRef.current) return null
    return fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const designImage = exportDesign()
    
    // In production, send this to your backend/email service
    console.log({
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
      design: {
        capColor: CAP_COLORS.find(c => c.value === capColor)?.name,
        textContent,
        textColor: TEXT_COLORS.find(c => c.value === textColor)?.name,
        font: FONTS.find(f => f.value === selectedFont)?.name,
        decorationType: DECORATION_TYPES.find(d => d.value === decorationType)?.name,
        quantity,
      },
      designImage,
    })

    setIsSubmitted(true)
  }

  return (
    <>
      <Nav />
      <main className="designer-page">
        <section className="designer-hero">
          <div className="container">
            <Link href="/" className="designer-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="headline-md">Design Your Cap</h1>
            <p className="designer-subtitle">Customize your premium headwear. Minimum order: 24 pieces.</p>
          </div>
        </section>

        <section className="designer-workspace">
          <div className="container">
            <div className="designer-grid">
              {/* Canvas Area */}
              <div className="designer-canvas-area">
                <div className="canvas-container">
                  <canvas ref={canvasRef} />
                  {!isLoaded && (
                    <div className="canvas-loading">
                      <span>Loading designer...</span>
                    </div>
                  )}
                </div>
                
                {/* View Toggle */}
                <div className="view-toggle">
                  <button
                    className={`view-btn ${view === 'front' ? 'active' : ''}`}
                    onClick={() => handleViewChange('front')}
                  >
                    Front
                  </button>
                  <button
                    className={`view-btn ${view === 'side' ? 'active' : ''}`}
                    onClick={() => handleViewChange('side')}
                  >
                    Side
                  </button>
                </div>

                <p className="canvas-hint">Click text to edit. Drag to reposition.</p>
              </div>

              {/* Controls */}
              <div className="designer-controls">
                {/* Cap Color */}
                <div className="control-group">
                  <label className="control-label">Cap Color</label>
                  <div className="color-swatches">
                    {CAP_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`color-swatch ${capColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setCapColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Input */}
                <div className="control-group">
                  <label className="control-label">Your Text</label>
                  <input
                    type="text"
                    value={textContent}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="control-input"
                    maxLength={20}
                    placeholder="Enter text..."
                  />
                </div>

                {/* Text Color */}
                <div className="control-group">
                  <label className="control-label">Text Color</label>
                  <div className="color-swatches">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`color-swatch ${textColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setTextColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div className="control-group">
                  <label className="control-label">Font Style</label>
                  <div className="font-options">
                    {FONTS.map((font) => (
                      <button
                        key={font.value}
                        className={`font-btn ${selectedFont === font.value ? 'active' : ''}`}
                        style={{ fontFamily: font.value }}
                        onClick={() => setSelectedFont(font.value)}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decoration Type */}
                <div className="control-group">
                  <label className="control-label">Decoration</label>
                  <div className="decoration-options">
                    {DECORATION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        className={`decoration-btn ${decorationType === type.value ? 'active' : ''}`}
                        onClick={() => setDecorationType(type.value)}
                      >
                        <span className="decoration-name">{type.name}</span>
                        <span className="decoration-desc">{type.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="control-group">
                  <label className="control-label">Quantity</label>
                  <div className="quantity-selector">
                    <button 
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(24, quantity - 12))}
                    >
                      -
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => setQuantity(quantity + 12)}
                    >
                      +
                    </button>
                  </div>
                  <span className="qty-hint">Minimum 24 pieces</span>
                </div>

                {/* CTA */}
                <button 
                  className="designer-cta"
                  onClick={() => setShowSubmitModal(true)}
                >
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close"
                onClick={() => setShowSubmitModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {!isSubmitted ? (
                <>
                  <h2 className="modal-title">Request Your Quote</h2>
                  <p className="modal-subtitle">We&apos;ll get back to you within 24 hours.</p>

                  <div className="modal-summary">
                    <h4>Your Design</h4>
                    <ul>
                      <li><span>Cap:</span> {CAP_COLORS.find(c => c.value === capColor)?.name}</li>
                      <li><span>Text:</span> {textContent}</li>
                      <li><span>Method:</span> {DECORATION_TYPES.find(d => d.value === decorationType)?.name}</li>
                      <li><span>Quantity:</span> {quantity} pieces</li>
                    </ul>
                  </div>

                  <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        required
                        className="form-input"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        className="form-input"
                      />
                    </div>
                    <input
                      type="text"
                      name="company"
                      placeholder="Company (optional)"
                      className="form-input"
                    />
                    <textarea
                      name="message"
                      placeholder="Additional notes or requirements..."
                      rows={3}
                      className="form-textarea"
                    />
                    <button type="submit" className="form-submit">
                      Send Request
                    </button>
                  </form>
                </>
              ) : (
                <div className="modal-success">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 className="modal-title">Request Sent</h2>
                  <p className="modal-subtitle">
                    We&apos;ve received your design. Check your inbox for confirmation.
                  </p>
                  <button 
                    className="form-submit"
                    onClick={() => {
                      setShowSubmitModal(false)
                      setIsSubmitted(false)
                    }}
                  >
                    Design Another
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

// Helper: Adjust color brightness
function adjustColor(hex: string, amount: number): string {
  const clamp = (num: number) => Math.min(255, Math.max(0, num))
  
  let color = hex.replace('#', '')
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('')
  }
  
  const num = parseInt(color, 16)
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0x00ff) + amount)
  const b = clamp((num & 0x0000ff) + amount)
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
