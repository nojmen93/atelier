'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Logo } from '@/app/admin/styles/[id]/StyleEditForm'

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

export default function CustomizationTab({ styleId, images, logos }: CustomizationTabProps) {
  const [customizations, setCustomizations] = useState<Customization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [logoId, setLogoId] = useState('')
  const [placement, setPlacement] = useState('center_front')
  const [technique, setTechnique] = useState('embroidery')
  const [pantoneColor, setPantoneColor] = useState('')
  const [widthCm, setWidthCm] = useState('5')
  const [heightCm, setHeightCm] = useState('5')
  const [editingId, setEditingId] = useState<string | null>(null)

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
      alert('Please select a logo.')
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
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase
        .from('customizations')
        .insert(payload)
      if (error) { alert(error.message); setSaving(false); return }
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
      alert(error.message)
    } else {
      setCustomizations((prev) => prev.filter((c) => c.id !== id))
    }
    setDeletingId(null)
  }

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

  const selectedLogo = logos.find((l) => l.id === logoId)
  const selectedPlacement = PLACEMENTS.find((p) => p.value === placement) || PLACEMENTS[0]

  // Scale logo on canvas: use widthCm relative to garment (assume ~50cm garment width)
  const logoWidthPercent = Math.min(40, Math.max(5, (parseFloat(widthCm) || 5) / 50 * 100))
  const logoHeightPercent = Math.min(40, Math.max(5, (parseFloat(heightCm) || 5) / 70 * 100))

  const canPreviewLogo = selectedLogo && (selectedLogo.file_format === 'PNG' || selectedLogo.file_format === 'SVG')

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'
  const smallInputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

  return (
    <div>
      {/* Customization Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Preview Canvas */}
        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Preview</h3>
          <div className="relative border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
            <img
              src={images[0]}
              alt="Product"
              className="w-full object-contain"
              style={{ maxHeight: '500px' }}
            />

            {/* Placement guide crosshair */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${selectedPlacement.x}%`,
                top: `${selectedPlacement.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Crosshair lines */}
              <div className="absolute w-8 h-px bg-white/30 -left-4 top-1/2" />
              <div className="absolute h-8 w-px bg-white/30 left-1/2 -top-4" />

              {/* Logo overlay */}
              {canPreviewLogo ? (
                <img
                  src={selectedLogo.file_url}
                  alt="Logo"
                  className="opacity-80"
                  style={{
                    width: `${logoWidthPercent * 3}px`,
                    height: `${logoHeightPercent * 3}px`,
                    objectFit: 'contain',
                    transform: 'translate(-50%, -50%)',
                    position: 'relative',
                    left: '50%',
                    top: '50%',
                  }}
                />
              ) : (
                <div
                  className="border-2 border-dashed border-white/40 rounded flex items-center justify-center"
                  style={{
                    width: `${logoWidthPercent * 3}px`,
                    height: `${logoHeightPercent * 3}px`,
                    transform: 'translate(-50%, -50%)',
                    position: 'relative',
                    left: '50%',
                    top: '50%',
                  }}
                >
                  {selectedLogo ? (
                    <span className="text-white/40 text-xs">{selectedLogo.file_format}</span>
                  ) : (
                    <span className="text-white/30 text-xs">Logo</span>
                  )}
                </div>
              )}
            </div>

            {/* Placement label */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-xs text-neutral-300">
              {selectedPlacement.label}
            </div>
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
              <label className="block text-sm font-medium mb-2">Logo</label>
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
              <label className="block text-sm font-medium mb-2">Placement</label>
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
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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
          <p className="text-neutral-500 text-sm">Loading...</p>
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
