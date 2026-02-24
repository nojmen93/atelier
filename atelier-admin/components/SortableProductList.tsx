'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  material: string | null
  images: string[] | null
  published: boolean
  display_order: number
  subcategories: { name: string; categories: { name: string } } | null
  variants: { id: string }[]
}

function DragHandle() {
  return (
    <div className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing p-2 text-neutral-600 hover:text-neutral-400 transition">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </div>
  )
}

function SortableProductCard({ product, isDragging }: { product: Product; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-neutral-800 rounded-lg overflow-hidden transition ${
        isSortableDragging ? 'opacity-30' : 'hover:border-neutral-600'
      } ${isDragging ? 'shadow-2xl border-neutral-600 bg-neutral-950' : ''}`}
    >
      <div className="flex">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center border-r border-neutral-800 bg-neutral-900/50"
        >
          <DragHandle />
        </div>
        <Link
          href={`/admin/products/${product.id}`}
          className="flex-1 p-6 block"
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-neutral-900 rounded mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          <p className="text-neutral-500 text-sm">{product.material}</p>
          {product.subcategories && (
            <p className="text-neutral-500 text-xs mt-1">
              {product.subcategories.categories.name}
              {' / '}
              {product.subcategories.name}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded ${
              product.published
                ? 'bg-green-900 text-green-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}>
              {product.published ? 'Published' : 'Draft'}
            </span>
            {product.variants?.length > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-400">
                {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

function ProductOverlay({ product }: { product: Product }) {
  return (
    <div className="border border-neutral-600 rounded-lg overflow-hidden shadow-2xl bg-neutral-950 opacity-90">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-white">{product.name}</h3>
        <p className="text-neutral-500 text-sm">{product.material}</p>
      </div>
    </div>
  )
}

export default function SortableProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeProduct = activeId ? products.find((p) => p.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(products, oldIndex, newIndex)
    setProducts(reordered)

    setSaving(true)
    const supabase = createClient()
    const updates = reordered.map((p, i) => ({
      id: p.id,
      display_order: i,
    }))

    for (const { id, display_order } of updates) {
      await supabase.from('products').update({ display_order }).eq('id', id)
    }
    setSaving(false)
  }

  return (
    <>
      {saving && (
        <div className="text-xs text-neutral-500 mb-2">Saving order...</div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <SortableProductCard key={product.id} product={product} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeProduct ? <ProductOverlay product={activeProduct} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
