'use client'

import { useHierarchy } from '@/lib/hierarchy-context'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  display_order: number
}

interface Concept {
  id: string
  name: string
  slug: string
  display_order: number
  categories: Category[]
}

const CONCEPT_DESCRIPTIONS: Record<string, string> = {
  culture: 'Creative, limited drops — Atelier originals',
  collection: 'Structured teamwear for tech companies',
  infrastructure: 'Operational garments for warehousing & logistics',
}

export default function HierarchyBrowser({ concepts }: { concepts: Concept[] }) {
  const { conceptId, categoryId, selectConcept, selectCategory, clearSelection, clearCategory } = useHierarchy()
  const router = useRouter()

  const selectedConcept = concepts.find((c) => c.id === conceptId)

  const handleCategoryClick = (cat: Category) => {
    selectCategory(cat.id, cat.name)
    router.push('/admin/styles')
  }

  return (
    <div>
      {/* Breadcrumb */}
      {conceptId && (
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={clearSelection} className="text-neutral-400 hover:text-white transition">
            All Concepts
          </button>
          <span className="text-neutral-600">/</span>
          {categoryId ? (
            <>
              <button onClick={clearCategory} className="text-neutral-400 hover:text-white transition">
                {selectedConcept?.name}
              </button>
              <span className="text-neutral-600">/</span>
              <span className="text-white font-medium">
                {selectedConcept?.categories.find((c) => c.id === categoryId)?.name}
              </span>
            </>
          ) : (
            <span className="text-white font-medium">{selectedConcept?.name}</span>
          )}
        </div>
      )}

      {/* Concept Grid */}
      {!conceptId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concepts.map((concept) => {
            const desc = CONCEPT_DESCRIPTIONS[concept.slug] || ''
            const categories = (concept.categories || []).sort((a, b) => a.display_order - b.display_order)

            return (
              <button
                key={concept.id}
                onClick={() => selectConcept(concept.id, concept.name)}
                className="border border-neutral-800 rounded-lg p-6 text-left hover:border-neutral-600 transition group"
              >
                <h2 className="text-xl font-semibold mb-1 group-hover:text-white transition">
                  {concept.name}
                </h2>
                {desc && <p className="text-neutral-500 text-sm mb-4">{desc}</p>}
                <div className="text-xs text-neutral-600">
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Category List */}
      {conceptId && !categoryId && selectedConcept && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedConcept.name}</h2>
          <p className="text-neutral-500 text-sm mb-6">
            {CONCEPT_DESCRIPTIONS[selectedConcept.slug] || ''}
          </p>

          {selectedConcept.categories.length === 0 ? (
            <div className="border border-neutral-800 border-dashed rounded-lg p-12 text-center">
              <p className="text-neutral-500 text-sm">No categories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedConcept.categories
                .sort((a, b) => a.display_order - b.display_order)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="border border-neutral-800 rounded-lg p-5 text-left hover:border-neutral-600 transition"
                  >
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">View styles &rarr;</p>
                  </button>
                ))}
            </div>
          )}

          <button
            onClick={() => {
              selectConcept(selectedConcept.id, selectedConcept.name)
              router.push('/admin/styles')
            }}
            className="mt-6 text-sm text-neutral-400 hover:text-white transition"
          >
            View all {selectedConcept.name} styles &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
