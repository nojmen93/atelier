'use client'

import { useHierarchy } from '@/lib/hierarchy-context'
import { useRouter } from 'next/navigation'
import { GENDERS, GENDER_LABELS, getCategoriesForGender } from '@/lib/product-hierarchy'

interface Category {
  id: string
  name: string
  slug: string
  display_order: number
}

interface StyleRef {
  id: string
  concept_id: string
  gender: string
  category_id: string
}

interface Concept {
  id: string
  name: string
  slug: string
  display_order: number
  categories: Category[]
}

function productLabel(count: number) {
  return `${count} ${count === 1 ? 'product' : 'products'}`
}

export default function HierarchyBrowser({ concepts, styles }: { concepts: Concept[]; styles: StyleRef[] }) {
  const {
    conceptId,
    conceptName,
    genderId,
    genderName,
    categoryId,
    selectConcept,
    selectGender,
    selectCategory,
    clearSelection,
    clearGender,
    clearCategory,
  } = useHierarchy()
  const router = useRouter()

  const selectedConcept = concepts.find((c) => c.id === conceptId)

  const handleCategoryClick = (cat: Category) => {
    selectCategory(cat.id, cat.name)
    router.push('/admin/styles')
  }

  const handleGenderClick = (genderValue: string) => {
    selectGender(genderValue, GENDER_LABELS[genderValue] || genderValue)
  }

  // Get filtered categories based on selected concept and gender
  const filteredCategories = selectedConcept && genderId
    ? getCategoriesForGender(
        selectedConcept.name,
        genderId,
        selectedConcept.categories
      ).sort((a, b) => a.display_order - b.display_order)
    : []

  return (
    <div>
      {/* Breadcrumb */}
      {conceptId && (
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={clearSelection} className="text-neutral-400 hover:text-white transition">
            All Concepts
          </button>
          <span className="text-neutral-600">/</span>
          {genderId ? (
            <>
              <button onClick={clearGender} className="text-neutral-400 hover:text-white transition">
                {conceptName}
              </button>
              <span className="text-neutral-600">/</span>
              {categoryId ? (
                <>
                  <button onClick={clearCategory} className="text-neutral-400 hover:text-white transition">
                    {genderName}
                  </button>
                  <span className="text-neutral-600">/</span>
                  <span className="text-white font-medium">
                    {selectedConcept?.categories.find((c) => c.id === categoryId)?.name}
                  </span>
                </>
              ) : (
                <span className="text-white font-medium">{genderName}</span>
              )}
            </>
          ) : (
            <span className="text-white font-medium">{conceptName}</span>
          )}
        </div>
      )}

      {/* Level 1: Concept Grid */}
      {!conceptId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((concept) => {
            const count = styles.filter((s) => s.concept_id === concept.id).length

            return (
              <button
                key={concept.id}
                onClick={() => selectConcept(concept.id, concept.name)}
                className="border border-neutral-800 rounded-lg p-6 text-left hover:border-neutral-600 transition group"
              >
                <h2 className="text-xl font-semibold mb-1 group-hover:text-white transition">
                  {concept.name}
                </h2>
                <div className="text-xs text-neutral-600 mt-2">
                  {productLabel(count)}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Level 2: Gender Selection */}
      {conceptId && !genderId && selectedConcept && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedConcept.name}</h2>
          <p className="text-neutral-500 text-sm mb-6">Select gender</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GENDERS.map((g) => {
              const count = styles.filter(
                (s) => s.concept_id === conceptId && s.gender === g.value
              ).length
              return (
                <button
                  key={g.value}
                  onClick={() => handleGenderClick(g.value)}
                  className="border border-neutral-800 rounded-lg p-5 text-left hover:border-neutral-600 transition"
                >
                  <h3 className="font-medium">{g.label}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{productLabel(count)}</p>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => {
              router.push('/admin/styles')
            }}
            className="mt-6 text-sm text-neutral-400 hover:text-white transition"
          >
            View all {selectedConcept.name} products &rarr;
          </button>
        </div>
      )}

      {/* Level 3: Category List */}
      {conceptId && genderId && !categoryId && selectedConcept && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedConcept.name} &mdash; {genderName}
          </h2>
          <p className="text-neutral-500 text-sm mb-6">Select category</p>

          {filteredCategories.length === 0 ? (
            <div className="border border-neutral-800 border-dashed rounded-lg p-12 text-center">
              <p className="text-neutral-500 text-sm">No categories available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => {
                const count = styles.filter(
                  (s) => s.concept_id === conceptId && s.gender === genderId && s.category_id === cat.id
                ).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="border border-neutral-800 rounded-lg p-5 text-left hover:border-neutral-600 transition"
                  >
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{productLabel(count)}</p>
                  </button>
                )
              })}
            </div>
          )}

          <button
            onClick={() => {
              router.push('/admin/styles')
            }}
            className="mt-6 text-sm text-neutral-400 hover:text-white transition"
          >
            View all {selectedConcept.name} / {genderName} products &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
