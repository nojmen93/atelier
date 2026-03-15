'use client'

import { useState, useRef, useEffect } from 'react'

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
  deleteLabel?: string
}

export default function RowActions({ onEdit, onDelete, deleteLabel = 'Delete' }: RowActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Edit — clear and always visible */}
      <button
        type="button"
        onClick={onEdit}
        className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-800 rounded hover:border-neutral-600 transition"
      >
        Edit
      </button>

      {/* Three-dot menu for delete */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-300 rounded hover:bg-neutral-800 transition"
          aria-label="More actions"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1">
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete() }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-neutral-800 transition"
            >
              {deleteLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
