'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Logo } from '@/app/admin/styles/[id]/StyleEditForm'
import * as fabric from 'fabric'

const PLACEMENTS = [
  { value: 'center_front', label: 'Center Front', x: 50, y: 20 },
  { value: 'center_back', label: 'Center Back', x: 50, y: 20 },
  { value: 'hsp', label: 'From HSP (High Shoulder Point)', x: 85, y: 15 },
  { value: 'wrs', label: 'Center on WRS (Waist Right Seam)', x: 75, y: 50 },
  { value: 'wls', label: 'Center on WLS (Waist Left Seam)', x: 25, y: 50 },
]

const TECHNIQUES = [
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'print', label: 'Print' },
]

interface Customization {
  id: string
  style_id: string
  logo_id: string
  placement: string
  technique: string
  pantone_color: string | null
  width_cm: number | null
  height_cm: number | null
  mockup_url: string | null
  created_at: string
  logos: { company_name: string; file_url: string } | null
}

interface CustomizationTabProps {
  styleId: string
  images: string[]
  logos: Logo[]
}

const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 600

export default function CustomizationTab({ styleId, images, logos }: CustomizationTabProps) {
  const [customizations, setCustomizations] = useState<Customization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [logoId, setLogoId] = useState('')
  const [placement, setPlacement] = useState('center_front')
  const [technique, setTechnique] = useState('embroidery')
  const [pantoneColor, setPantoneColor] = useState('')
  const [widthCm, setWidthCm] = useState('5')
  const [heightCm, setHeightCm] = useState('5')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Canvas state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const logoObjectRef = useRef<fabric.FabricObject | null>(null)
  const embroideryOverlayRef = useRef<fabric.Rect | null>(null)

  const supabase = createClient()

  const fetchCustomizations = useCallback(async () => {
    const { data } = await supabase
      .from('customizations')
      .select('*, logos(company_name, file_url)')
      .eq('style_id', styleId)
      .order('created_at', { ascending: false })
    setCustomizations((data || []) as Customization[])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId])

  useEffect(() => {
    fetchCustomizations()
  }, [fetchCustomizations])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#0a0a0a',
      selection: false,
    })
    fabricCanvasRef.current = canvas

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [images.length])

  // Load background image when activeImageIndex changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || images.length === 0) return

    const imgUrl = images[activeImageIndex] || images[0]

    const imgEl = new Image()
    imgEl.crossOrigin = 'anonymous'
    imgEl.onload = () => {
      const fabricImg = new fabric.FabricImage(imgEl)
      const scale = Math.min(
        CANVAS_WIDTH / (fabricImg.width || 1),
        CANVAS_HEIGHT / (fabricImg.height || 1)
      )
      fabricImg.set({
        scaleX: scale,
        scaleY: scale,
        left: (CANVAS_WIDTH - (fabricImg.width || 0) * scale) / 2,
        top: (CANVAS_HEIGHT - (fabricImg.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
      })

      // Remove old background (first object, if it's an image)
      const objs = canvas.getObjects()
      if (objs.length > 0 && objs[0] !== logoObjectRef.current && objs[0] !== embroideryOverlayRef.current) {
        canvas.remove(objs[0])
      }
      canvas.insertAt(0, fabricImg)
      canvas.renderAll()
    }
    imgEl.src = imgUrl
  }, [activeImageIndex, images])

  // Update logo on canvas when form changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const selectedLogo = logos.find((l) => l.id === logoId)
    const selectedPlacement = PLACEMENTS.find((p) => p.value === placement) || PLACEMENTS[0]

    // Remove old logo and embroidery overlay
    if (logoObjectRef.current) {
      canvas.remove(logoObjectRef.current)
      logoObjectRef.current = null
    }
    if (embroideryOverlayRef.current) {
      canvas.remove(embroideryOverlayRef.current)
      embroideryOverlayRef.current = null
    }

    if (!selectedLogo) {
      // Show placeholder rectangle
      const logoW = Math.min(200, Math.max(30, (parseFloat(widthCm) || 5) / 50 * CANVAS_WIDTH))
      const logoH = Math.min(200, Math.max(30, (parseFloat(heightCm) || 5) / 70 * CANVAS_HEIGHT))
      const placeholder = new fabric.Rect({
        width: logoW,
        height: logoH,
        left: (selectedPlacement.x / 100) * CANVAS_WIDTH - logoW / 2,
        top: (selectedPlacement.y / 100) * CANVAS_HEIGHT - logoH / 2,
        fill: 'transparent',
        stroke: 'rgba(255,255,255,0.3)',
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        selectable: true,
        hasControls: false,
        hasBorders: true,
        borderColor: '#fff',
        cornerColor: '#fff',
      })
      canvas.add(placeholder)
      logoObjectRef.current = placeholder
      canvas.renderAll()
      return
    }

    const canPreview = selectedLogo.file_format === 'PNG' || selectedLogo.file_format === 'SVG'

    if (canPreview) {
      const imgEl = new Image()
      imgEl.crossOrigin = 'anonymous'
      imgEl.onload = () => {
        const logoW = Math.min(200, Math.max(30, (parseFloat(widthCm) || 5) / 50 * CANVAS_WIDTH))
        const logoH = Math.min(200, Math.max(30, (parseFloat(heightCm) || 5) / 70 * CANVAS_HEIGHT))
        const fabricLogo = new fabric.FabricImage(imgEl)
        const scaleX = logoW / (fabricLogo.width || 1)
        const scaleY = logoH / (fabricLogo.height || 1)
        const scale = Math.min(scaleX, scaleY)

        fabricLogo.set({
          scaleX: scale,
          scaleY: scale,
          left: (selectedPlacement.x / 100) * CANVAS_WIDTH - (fabricLogo.width || 0) * scale / 2,
          top: (selectedPlacement.y / 100) * CANVAS_HEIGHT - (fabricLogo.height || 0) * scale / 2,
          opacity: technique === 'embroidery' ? 0.85 : 0.95,
          selectable: true,
          hasControls: false,
          hasBorders: true,
          borderColor: '#fff',
          cornerColor: '#fff',
        })

        canvas.add(fabricLogo)
        logoObjectRef.current = fabricLogo

        // Embroidery texture overlay
        if (technique === 'embroidery') {
          const stitchOverlay = new fabric.Rect({
            width: (fabricLogo.width || 0) * scale,
            height: (fabricLogo.height || 0) * scale,
            left: fabricLogo.left,
            top: fabricLogo.top,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.15)',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.4)',
              blur: 3,
              offsetX: 1,
              offsetY: 2,
            }),
          })
          canvas.add(stitchOverlay)
          embroideryOverlayRef.current = stitchOverlay
        }

        canvas.renderAll()
      }
      imgEl.src = selectedLogo.file_url
    } else {
      // Non-previewable format — show labeled box
      const logoW = Math.min(200, Math.max(30, (parseFloat(widthCm) || 5) / 50 * CANVAS_WIDTH))
      const logoH = Math.min(200, Math.max(30, (parseFloat(heightCm) || 5) / 70 * CANVAS_HEIGHT))
      const group = new fabric.Group([
        new fabric.Rect({
          width: logoW,
          height: logoH,
          fill: 'rgba(255,255,255,0.05)',
          stroke: 'rgba(255,255,255,0.3)',
          strokeWidth: 2,
          strokeDashArray: [6, 4],
          rx: 4,
          ry: 4,
        }),
        new fabric.FabricText(selectedLogo.file_format, {
          fontSize: 12,
          fill: 'rgba(255,255,255,0.4)',
          originX: 'center',
          originY: 'center',
          top: 0,
          left: 0,
        }),
      ], {
        left: (selectedPlacement.x / 100) * CANVAS_WIDTH - logoW / 2,
        top: (selectedPlacement.y / 100) * CANVAS_HEIGHT - logoH / 2,
        selectable: true,
        hasControls: false,
        hasBorders: true,
        borderColor: '#fff',
      })

      canvas.add(group)
      logoObjectRef.current = group
      canvas.renderAll()
    }
  }, [logoId, placement, technique, widthCm, heightCm, logos])

  const resetForm = () => {
    setLogoId('')
    setPlacement('center_front')
    setTechnique('embroidery')
    setPantoneColor('')
    setWidthCm('5')
    setHeightCm('5')
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!logoId) {
      toast.error('Please select a logo.')
      return
    }
    setSaving(true)

    const payload = {
      style_id: styleId,
      logo_id: logoId,
      placement,
      technique,
      pantone_color: pantoneColor || null,
      width_cm: widthCm ? parseFloat(widthCm) : null,
      height_cm: heightCm ? parseFloat(heightCm) : null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('customizations')
        .update(payload)
        .eq('id', editingId)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Customization updated')
    } else {
      const { error } = await supabase
        .from('customizations')
        .insert(payload)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Customization saved')
    }

    resetForm()
    setSaving(false)
    fetchCustomizations()
  }

  const handleEdit = (c: Customization) => {
    setEditingId(c.id)
    setLogoId(c.logo_id)
    setPlacement(c.placement)
    setTechnique(c.technique)
    setPantoneColor(c.pantone_color || '')
    setWidthCm(c.width_cm?.toString() || '5')
    setHeightCm(c.height_cm?.toString() || '5')
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('customizations').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      setCustomizations((prev) => prev.filter((c) => c.id !== id))
      toast.success('Customization deleted')
    }
    setDeletingId(null)
  }

  const handleExportMockup = async () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    setExporting(true)
    try {
      // Generate PNG data URL from canvas
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2,
      })

      // Download to user's computer
      const link = document.createElement('a')
      link.download = `mockup-${styleId}-${placement}.png`
      link.href = dataUrl
      link.click()

      // Upload to Supabase Storage
      const blob = await (await fetch(dataUrl)).blob()
      const fileName = `mockups/${styleId}/${crypto.randomUUID()}.png`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, { contentType: 'image/png', upsert: false })

      if (uploadError) {
        toast.error(`Download complete, but storage upload failed: ${uploadError.message}`)
      } else {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        // Save mockup_url to existing customization if editing
        if (editingId) {
          await supabase
            .from('customizations')
            .update({ mockup_url: urlData.publicUrl })
            .eq('id', editingId)
          fetchCustomizations()
        }

        toast.success('Mockup exported and saved')
      }
    } catch {
      toast.error('Export failed')
    }
    setExporting(false)
  }

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.1))
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.1))
  const handleZoomReset = () => setZoom(1)

  // No images — show message
  if (images.length === 0) {
    return (
      <div className="border border-neutral-800 rounded-lg p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-neutral-600">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p className="text-neutral-400 mb-2">Add product images first to enable customization.</p>
        <p className="text-neutral-600 text-sm">Switch to the Details tab and upload at least one image.</p>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'
  const smallInputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      {/* Customization Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Fabric.js Canvas */}
        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Preview</h3>

          {/* Image view tabs */}
          {images.length > 1 && (
            <div className="flex gap-1 mb-3">
              {images.map((_, idx) => {
                const labels = ['Front', 'Back', 'Detail']
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`px-3 py-1.5 text-xs rounded transition ${
                      activeImageIndex === idx
                        ? 'bg-white text-black font-medium'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    {labels[idx] || `View ${idx + 1}`}
                  </button>
                )
              })}
            </div>
          )}

          <div className="relative border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950">
            <div
              className="flex items-center justify-center"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s',
              }}
            >
              <canvas ref={canvasRef} />
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center bg-black/70 text-white rounded hover:bg-black/90 transition text-sm"
              >
                -
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="h-8 px-2 flex items-center justify-center bg-black/70 text-neutral-400 rounded hover:bg-black/90 transition text-xs tabular-nums"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center bg-black/70 text-white rounded hover:bg-black/90 transition text-sm"
              >
                +
              </button>
            </div>

            {/* Placement label */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-xs text-neutral-300">
              {PLACEMENTS.find((p) => p.value === placement)?.label || placement}
            </div>

            {/* Embroidery indicator */}
            {technique === 'embroidery' && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-blue-900/70 border border-blue-700/50 rounded text-xs text-blue-300">
                Embroidery texture
              </div>
            )}
          </div>

          {/* Export button */}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleExportMockup}
              disabled={exporting}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-40"
            >
              {exporting ? 'Exporting...' : 'Download Mockup'}
            </button>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">
            {editingId ? 'Edit Customization' : 'New Customization'}
          </h3>
          <div className="space-y-5">
            {/* Logo selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Logo <span className="text-red-400">*</span></label>
              {logos.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No logos uploaded yet.{' '}
                  <a href="/admin/logos/new" className="text-neutral-300 underline hover:text-white">Upload a logo</a>
                </p>
              ) : (
                <select
                  value={logoId}
                  onChange={(e) => setLogoId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a logo...</option>
                  {logos.map((logo) => (
                    <option key={logo.id} value={logo.id}>
                      {logo.company_name} ({logo.file_format})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Placement */}
            <div>
              <label className="block text-sm font-medium mb-2">Placement <span className="text-red-400">*</span></label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className={inputClass}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Technique */}
            <div>
              <label className="block text-sm font-medium mb-2">Technique</label>
              <div className="flex gap-3">
                {TECHNIQUES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTechnique(t.value)}
                    className={`flex-1 px-4 py-3 rounded border text-sm font-medium transition ${
                      technique === t.value
                        ? t.value === 'embroidery'
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {technique === 'embroidery' && (
                <p className="text-xs text-blue-400/60 mt-1.5">Stitch texture and raised effect applied to preview</p>
              )}
            </div>

            {/* Pantone Color */}
            <div>
              <label className="block text-sm font-medium mb-2">Pantone Color</label>
              <input
                type="text"
                value={pantoneColor}
                onChange={(e) => setPantoneColor(e.target.value)}
                className={inputClass}
                placeholder="e.g. Pantone 186 C"
              />
            </div>

            {/* Logo Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Width (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  className={smallInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className={smallInputClass}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !logoId}
                className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingId ? 'Update Customization' : 'Save Customization'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 text-sm text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Customizations Table */}
      <div className="pt-8 border-t border-neutral-800">
        <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wide">
          Saved Customizations
          {customizations.length > 0 && (
            <span className="ml-2 text-neutral-600">({customizations.length})</span>
          )}
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-neutral-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : customizations.length === 0 ? (
          <p className="text-neutral-600 text-sm">No customizations saved yet.</p>
        ) : (
          <div className="border border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Logo</th>
                  <th className="text-left px-4 py-3 font-medium">Placement</th>
                  <th className="text-left px-4 py-3 font-medium">Technique</th>
                  <th className="text-left px-4 py-3 font-medium">Color</th>
                  <th className="text-left px-4 py-3 font-medium">Size</th>
                  <th className="text-right px-4 py-3 font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customizations.map((c) => {
                  const placementLabel = PLACEMENTS.find((p) => p.value === c.placement)?.label || c.placement
                  return (
                    <tr key={c.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {c.logos?.file_url && (
                            <img
                              src={c.logos.file_url}
                              alt=""
                              className="w-6 h-6 object-contain rounded"
                            />
                          )}
                          <span className="text-neutral-300">{c.logos?.company_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{placementLabel}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          c.technique === 'embroidery'
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-purple-900/50 text-purple-300'
                        }`}>
                          {c.technique === 'embroidery' ? 'Embroidery' : 'Print'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{c.pantone_color || '—'}</td>
                      <td className="px-4 py-3 text-neutral-400 tabular-nums">
                        {c.width_cm && c.height_cm
                          ? `${Number(c.width_cm).toFixed(1)} x ${Number(c.height_cm).toFixed(1)} cm`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(c)}
                            className="px-3 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-700 rounded hover:border-neutral-500 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="px-3 py-1 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded hover:border-red-700 transition"
                          >
                            {deletingId === c.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
