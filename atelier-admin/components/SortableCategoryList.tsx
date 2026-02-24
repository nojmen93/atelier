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

interface Subcategory {
  id: string
  name: string
  display_order: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  subcategories: Subcategory[]
}

function DragHandle() {
  return (
    <div className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing p-3 text-neutral-600 hover:text-neutral-400 transition">
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

function SortableCategoryCard({ category }: { category: Category }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sortedSubs = [...category.subcategories].sort(
    (a, b) => a.display_order - b.display_order
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-neutral-800 rounded-lg overflow-hidden transition ${
        isDragging ? 'opacity-30' : 'hover:border-neutral-600'
      }`}
    >
      <div className="flex">
        <div
          {...attributes}
          {...listeners}
          className="flex items-start pt-6 border-r border-neutral-800 bg-neutral-900/50"
        >
          <DragHandle />
        </div>
        <Link
          href={`/admin/categories/${category.id}`}
          className="flex-1 p-6 block"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <span className="text-sm text-neutral-500">/{category.slug}</span>
          </div>
          {category.description && (
            <p className="text-neutral-400 text-sm mb-4">{category.description}</p>
          )}
          {sortedSubs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-800">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">Subcategories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {sortedSubs.map((sub) => (
                  <span
                    key={sub.id}
                    className="px-3 py-1 text-sm bg-neutral-800 text-neutral-300 rounded"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sortedSubs.length === 0 && (
            <p className="text-neutral-600 text-sm mt-2">No subcategories</p>
          )}
        </Link>
      </div>
    </div>
  )
}

function CategoryOverlay({ category }: { category: Category }) {
  return (
    <div className="border border-neutral-600 rounded-lg overflow-hidden shadow-2xl bg-neutral-950 opacity-90 p-6">
      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
      <span className="text-sm text-neutral-500">/{category.slug}</span>
    </div>
  )
}

export default function SortableCategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeCategory = activeId ? categories.find((c) => c.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(categories, oldIndex, newIndex)
    setCategories(reordered)

    setSaving(true)
    const supabase = createClient()
    const updates = reordered.map((c, i) => ({
      id: c.id,
      display_order: i,
    }))

    for (const { id, display_order } of updates) {
      await supabase.from('categories').update({ display_order }).eq('id', id)
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
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {categories.map((category) => (
              <SortableCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCategory ? <CategoryOverlay category={activeCategory} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
