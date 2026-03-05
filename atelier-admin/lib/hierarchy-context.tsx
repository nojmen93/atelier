'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface HierarchySelection {
  conceptId: string | null
  conceptName: string | null
  categoryId: string | null
  categoryName: string | null
}

interface HierarchyContextValue extends HierarchySelection {
  selectConcept: (id: string, name: string) => void
  selectCategory: (id: string, name: string) => void
  clearSelection: () => void
  clearCategory: () => void
}

const HierarchyContext = createContext<HierarchyContextValue | null>(null)

export function HierarchyProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<HierarchySelection>({
    conceptId: null,
    conceptName: null,
    categoryId: null,
    categoryName: null,
  })

  const selectConcept = useCallback((id: string, name: string) => {
    setSelection({ conceptId: id, conceptName: name, categoryId: null, categoryName: null })
  }, [])

  const selectCategory = useCallback((id: string, name: string) => {
    setSelection((prev) => ({ ...prev, categoryId: id, categoryName: name }))
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ conceptId: null, conceptName: null, categoryId: null, categoryName: null })
  }, [])

  const clearCategory = useCallback(() => {
    setSelection((prev) => ({ ...prev, categoryId: null, categoryName: null }))
  }, [])

  return (
    <HierarchyContext.Provider value={{ ...selection, selectConcept, selectCategory, clearSelection, clearCategory }}>
      {children}
    </HierarchyContext.Provider>
  )
}

export function useHierarchy() {
  const ctx = useContext(HierarchyContext)
  if (!ctx) throw new Error('useHierarchy must be used within HierarchyProvider')
  return ctx
}
