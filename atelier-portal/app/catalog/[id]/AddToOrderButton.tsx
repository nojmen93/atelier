'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { addToOrder } from '@/lib/order-actions'

type Variant = {
  id: string
  size: string | null
  color: string | null
  sku: string | null
  stock: number
  price_modifier: number
}

const colorMap: Record<string, string> = {
  Black: '#000000',
  White: '#FFFFFF',
  Navy: '#1B2A4A',
  Red: '#C0392B',
  Blue: '#2980B9',
  Green: '#27AE60',
  Grey: '#7F8C8D',
  Gray: '#7F8C8D',
  Beige: '#D4C5A9',
  Brown: '#6D4C41',
  Pink: '#E91E8C',
  Yellow: '#F1C40F',
  Orange: '#E67E22',
  Purple: '#8E44AD',
  Cream: '#F5F0E1',
  Charcoal: '#36454F',
  Olive: '#556B2F',
  Burgundy: '#800020',
  Teal: '#008080',
  Coral: '#FF7F50',
  Khaki: '#C3B091',
  Tan: '#D2B48C',
  Ivory: '#FFFFF0',
  Sand: '#C2B280',
  Stone: '#928E85',
}

export default function AddToOrderButton({
  styleId,
  unitPrice,
  variantsByColor,
}: {
  styleId: string
  unitPrice: number
  variantsByColor: Record<string, Variant[]>
}) {
  const colors = Object.keys(variantsByColor)
  const hasMultipleColors = colors.length > 1
  // Auto-select only if there's exactly 1 color
  const [selectedColor, setSelectedColor] = useState(colors.length === 1 ? colors[0] : '')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const currentVariants = selectedColor ? (variantsByColor[selectedColor] ?? []) : []
  const selectedVariant = currentVariants.find((v) => v.id === selectedVariantId)
  const canAdd = !!selectedColor && !!selectedVariantId

  const handleAdd = async () => {
    if (!selectedColor && !selectedVariantId) {
      setError('Please select a color and size')
      return
    }
    if (!selectedColor) {
      setError('Please select a color')
      return
    }
    if (!selectedVariantId) {
      setError('Please select a size')
      return
    }

    setError('')
    setStatus('adding')

    const result = await addToOrder(styleId, selectedVariantId)

    if (result.error) {
      toast.error(result.error)
      setError(result.error)
      setStatus('idle')
      return
    }

    toast.success('Added to order')
    setStatus('added')
    setTimeout(() => {
      window.location.href = '/orders/new'
    }, 600)
  }

  if (colors.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No variants available</p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Color selection — always shown first */}
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
          Color{selectedColor ? ` — ${selectedColor}` : ''}
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {colors.map((color) => {
            const hex = colorMap[color]
            const isSelected = selectedColor === color

            if (hex) {
              // Swatch circle (24px) for colors with known hex
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedVariantId('')
                    setError('')
                  }}
                  title={color}
                  className={`w-6 h-6 rounded-full transition-all ${
                    isSelected
                      ? 'ring-2 ring-foreground ring-offset-2 ring-offset-black scale-110'
                      : 'ring-1 ring-neutral-600 hover:ring-neutral-400'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              )
            }

            // Labeled chip for colors without known hex
            return (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color)
                  setSelectedVariantId('')
                  setError('')
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  isSelected
                    ? 'border-foreground text-foreground bg-neutral-800'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                {color}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size selection — shown after color is selected */}
      {selectedColor && (
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {currentVariants.map((v) => {
              const inStock = v.stock > 0
              const isSelected = selectedVariantId === v.id

              return (
                <button
                  key={v.id}
                  disabled={!inStock}
                  onClick={() => {
                    setSelectedVariantId(v.id)
                    setError('')
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded border transition font-medium ${
                    !inStock
                      ? 'border-neutral-800 text-neutral-700 line-through cursor-not-allowed opacity-40'
                      : isSelected
                        ? 'border-foreground text-foreground bg-foreground/10'
                        : 'border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-foreground'
                  }`}
                >
                  {v.size || 'One Size'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Add to Order button */}
      <button
        onClick={handleAdd}
        disabled={status !== 'idle'}
        className={`w-full sm:w-auto px-8 py-2.5 rounded-md text-sm font-medium transition ${
          status === 'added'
            ? 'bg-green-600 text-white'
            : canAdd
              ? 'bg-foreground text-background hover:bg-neutral-200'
              : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
        } disabled:opacity-60`}
      >
        {status === 'adding' ? 'Adding...' : status === 'added' ? 'Added!' : 'Add to Order'}
      </button>
    </div>
  )
}
