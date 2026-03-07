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
import { GENDER_LABELS, COLLECTION_TYPE_LABELS } from '@/lib/product-hierarchy'

interface Style {
  id: string
  name: string
  material: string | null
  images: string[] | null
  status: string
  gender: string
  collection_type: string
  display_order: number
  categories: { name: string; concepts: { name: string } } | null
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

function SortableStyleCard({ style, isDragging }: { style: Style; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: style.id })

  const domStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-900', text: 'text-green-100', label: 'Active' },
    development: { bg: 'bg-yellow-900', text: 'text-yellow-100', label: 'Development' },
    archived: { bg: 'bg-neutral-800', text: 'text-neutral-400', label: 'Archived' },
  }

  const statusStyle = statusConfig[style.status] || statusConfig.development

  return (
    <div
      ref={setNodeRef}
      style={domStyle}
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
          href={`/admin/styles/${style.id}`}
          className="flex-1 p-6 block"
        >
          {style.images?.[0] ? (
            <img
              src={style.images[0]}
              alt={style.name}
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
          <h3 className="text-xl font-semibold mb-2">{style.name}</h3>
          <p className="text-neutral-500 text-sm">{style.material}</p>
          {style.categories && (
            <p className="text-neutral-500 text-xs mt-1">
              {style.categories.concepts.name}
              {' / '}
              {GENDER_LABELS[style.gender] || style.gender}
              {' / '}
              {style.categories.name}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs rounded ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-400">
              {GENDER_LABELS[style.gender] || style.gender}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-400">
              {COLLECTION_TYPE_LABELS[style.collection_type] || style.collection_type}
            </span>
            {style.variants?.length > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-400">
                {style.variants.length} variant{style.variants.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

function StyleOverlay({ style }: { style: Style }) {
  return (
    <div className="border border-neutral-600 rounded-lg overflow-hidden shadow-2xl bg-neutral-950 opacity-90">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-white">{style.name}</h3>
        <p className="text-neutral-500 text-sm">{style.material}</p>
      </div>
    </div>
  )
}

export default function SortableStyleList({ initialStyles }: { initialStyles: Style[] }) {
  const [styles, setStyles] = useState(initialStyles)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeStyle = activeId ? styles.find((s) => s.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = styles.findIndex((s) => s.id === active.id)
    const newIndex = styles.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(styles, oldIndex, newIndex)
    setStyles(reordered)

    setSaving(true)
    const supabase = createClient()
    const updates = reordered.map((s, i) => ({
      id: s.id,
      display_order: i,
    }))

    for (const { id, display_order } of updates) {
      await supabase.from('styles').update({ display_order }).eq('id', id)
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
        <SortableContext items={styles.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <SortableStyleCard key={style.id} style={style} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeStyle ? <StyleOverlay style={activeStyle} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
