'use client'

import { useHierarchy } from '@/lib/hierarchy-context'

export default function StyleGalleryFilter() {
  const {
    conceptName,
    genderName,
    categoryName,
    clearSelection,
    clearGender,
    clearCategory,
  } = useHierarchy()

  if (!conceptName) return null

  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <span className="text-neutral-500">Viewing:</span>
      <button onClick={clearSelection} className="text-neutral-400 hover:text-white transition">
        All
      </button>
      <span className="text-neutral-600">/</span>
      {genderName ? (
        <>
          <button onClick={clearGender} className="text-neutral-400 hover:text-white transition">
            {conceptName}
          </button>
          <span className="text-neutral-600">/</span>
          {categoryName ? (
            <>
              <button onClick={clearCategory} className="text-neutral-400 hover:text-white transition">
                {genderName}
              </button>
              <span className="text-neutral-600">/</span>
              <span className="text-white font-medium">{categoryName}</span>
            </>
          ) : (
            <span className="text-white font-medium">{genderName}</span>
          )}
        </>
      ) : (
        <span className="text-white font-medium">{conceptName}</span>
      )}
      <button
        onClick={clearSelection}
        className="ml-2 text-xs text-neutral-600 hover:text-neutral-400 transition"
      >
        Clear filter
      </button>
    </div>
  )
}
