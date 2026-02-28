'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useEscapeClose } from '@/lib/useKeyboardSave'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const PRESET_COLORS = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Green', 'Blue', 'Beige']

interface BulkVariantModalProps {
  styleId: string
  styleName: string
  onClose: () => void
  onCreated: () => void
}

function generateSku(styleName: string, size: string, color: string): string {
  const code = styleName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((w) => w.substring(0, 2).toUpperCase())
    .join('')
    .substring(0, 4)
  const s = size.toUpperCase().substring(0, 3)
  const c = color
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
  return `${code}-${s}-${c}`
}

export default function BulkVariantModal({
  styleId,
  styleName,
  onClose,
  onCreated,
}: BulkVariantModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColor, setCustomColor] = useState('')
  const [defaultStock, setDefaultStock] = useState('0')
  const [creating, setCreating] = useState(false)

  useEscapeClose(onClose)
  const supabase = createClient()

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const addCustomColor = () => {
    const trimmed = customColor.trim()
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed])
    }
    setCustomColor('')
  }

  const combinations = selectedSizes.flatMap((size) =>
    selectedColors.map((color) => ({
      size,
      color,
      sku: generateSku(styleName, size, color),
    }))
  )

  const handleCreate = async () => {
    if (combinations.length === 0) return
    setCreating(true)

    const stock = parseInt(defaultStock) || 0
    const rows = combinations.map((c) => ({
      style_id: styleId,
      size: c.size,
      color: c.color,
      sku: c.sku,
      stock,
      price_modifier: 0,
    }))

    const { error } = await supabase.from('variants').insert(rows)

    if (error) {
      toast.error(error.message)
      setCreating(false)
      return
    }

    toast.success(`${combinations.length} variant${combinations.length !== 1 ? 's' : ''} created`)
    setCreating(false)
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-6">Quick Add Variants</h3>

        {/* Sizes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Select Sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 text-sm rounded border transition ${
                  selectedSizes.includes(size)
                    ? 'border-white bg-white text-black font-medium'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Select Colors</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-4 py-2 text-sm rounded border transition ${
                  selectedColors.includes(color)
                    ? 'border-white bg-white text-black font-medium'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
              placeholder="Custom color..."
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:border-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCustomColor}
              disabled={!customColor.trim()}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition disabled:opacity-30"
            >
              Add
            </button>
          </div>
          {selectedColors.filter((c) => !PRESET_COLORS.includes(c)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedColors
                .filter((c) => !PRESET_COLORS.includes(c))
                .map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className="px-4 py-2 text-sm rounded border border-white bg-white text-black font-medium transition"
                  >
                    {color}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Default Stock */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Default Stock per Variant</label>
          <input
            type="number"
            value={defaultStock}
            onChange={(e) => setDefaultStock(e.target.value)}
            min="0"
            className="w-32 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {/* Preview */}
        {combinations.length > 0 && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <div className="text-sm text-neutral-400 mb-2">
              {combinations.length} variant{combinations.length !== 1 ? 's' : ''} will be created:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {combinations.map((c) => (
                <span
                  key={`${c.size}-${c.color}`}
                  className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs"
                >
                  {c.size} / {c.color}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-600 font-mono">
              SKU preview: {combinations[0]?.sku}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={combinations.length === 0 || creating}
            className="px-6 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {creating
              ? 'Creating...'
              : `Create ${combinations.length} Variant${combinations.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
