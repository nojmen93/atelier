'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface HierarchySelection {
  conceptId: string | null
  conceptName: string | null
  genderId: string | null
  genderName: string | null
  categoryId: string | null
  categoryName: string | null
}

interface HierarchyContextValue extends HierarchySelection {
  selectConcept: (id: string, name: string) => void
  selectGender: (id: string, name: string) => void
  selectCategory: (id: string, name: string) => void
  clearSelection: () => void
  clearGender: () => void
  clearCategory: () => void
}

const EMPTY: HierarchySelection = {
  conceptId: null,
  conceptName: null,
  genderId: null,
  genderName: null,
  categoryId: null,
  categoryName: null,
}

const HierarchyContext = createContext<HierarchyContextValue | null>(null)

export function HierarchyProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<HierarchySelection>(EMPTY)

  const selectConcept = useCallback((id: string, name: string) => {
    setSelection({ ...EMPTY, conceptId: id, conceptName: name })
  }, [])

  const selectGender = useCallback((id: string, name: string) => {
    setSelection((prev) => ({
      ...prev,
      genderId: id,
      genderName: name,
      categoryId: null,
      categoryName: null,
    }))
  }, [])

  const selectCategory = useCallback((id: string, name: string) => {
    setSelection((prev) => ({ ...prev, categoryId: id, categoryName: name }))
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(EMPTY)
  }, [])

  const clearGender = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      genderId: null,
      genderName: null,
      categoryId: null,
      categoryName: null,
    }))
  }, [])

  const clearCategory = useCallback(() => {
    setSelection((prev) => ({ ...prev, categoryId: null, categoryName: null }))
  }, [])

  return (
    <HierarchyContext.Provider
      value={{
        ...selection,
        selectConcept,
        selectGender,
        selectCategory,
        clearSelection,
        clearGender,
        clearCategory,
      }}
    >
      {children}
    </HierarchyContext.Provider>
  )
}

export function useHierarchy() {
  const ctx = useContext(HierarchyContext)
  if (!ctx) throw new Error('useHierarchy must be used within HierarchyProvider')
  return ctx
}
