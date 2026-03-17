'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const colors = Object.keys(variantsByColor)
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? '')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const currentVariants = variantsByColor[selectedColor] ?? []

  const handleAdd = async () => {
    if (!selectedVariantId) {
      setError('Please select a size')
      return
    }

    setError('')
    setStatus('adding')

    const result = await addToOrder(styleId, selectedVariantId, unitPrice)

    if (result.error) {
      setError(result.error)
      setStatus('idle')
      return
    }

    setStatus('added')
    setTimeout(() => router.push('/orders/new'), 600)
  }

  if (colors.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No variants available</p>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xs text-neutral-500 uppercase tracking-wider">
        Select variant
      </h2>

      {/* Color picker */}
      {colors.length > 1 && (
        <div>
          <p className="text-xs text-neutral-500 mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hex = colorMap[color]
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedVariantId('')
                    setError('')
                  }}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition ${
                    selectedColor === color
                      ? 'border-foreground text-foreground'
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                  }`}
                >
                  {hex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-neutral-600 inline-block"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  {color}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size picker */}
      <div>
        <p className="text-xs text-neutral-500 mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {currentVariants.map((v) => {
            const inStock = v.stock > 0
            return (
              <button
                key={v.id}
                disabled={!inStock}
                onClick={() => {
                  setSelectedVariantId(v.id)
                  setError('')
                }}
                className={`text-xs px-3 py-1.5 rounded border transition ${
                  !inStock
                    ? 'border-neutral-800 text-neutral-600 line-through cursor-not-allowed'
                    : selectedVariantId === v.id
                      ? 'border-foreground text-foreground'
                      : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {v.size || 'One Size'}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <button
        onClick={handleAdd}
        disabled={status !== 'idle'}
        className={`w-full sm:w-auto px-8 py-2.5 rounded-md text-sm font-medium transition ${
          status === 'added'
            ? 'bg-green-600 text-white'
            : 'bg-foreground text-background hover:bg-neutral-200'
        } disabled:opacity-60`}
      >
        {status === 'adding' ? 'Adding...' : status === 'added' ? 'Added!' : 'Add to Order'}
      </button>
    </div>
  )
}
