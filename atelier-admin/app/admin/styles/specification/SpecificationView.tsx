'use client'

import { useHierarchy } from '@/lib/hierarchy-context'
import Link from 'next/link'
import { useState } from 'react'

interface Variant {
  id: string
  size: string
  color: string
  sku: string
  stock: number
}

interface Style {
  id: string
  name: string
  material: string | null
  description: string | null
  base_cost: number | null
  lead_time_days: number | null
  customization_mode: string | null
  status: string
  gender: string
  collection_type: string
  categories: unknown
  variants: Variant[]
}

function getCategoryName(style: Style): string | null {
  const raw = style.categories
  if (!raw) return null
  // Supabase may return as object or array depending on the relation
  const cat = (Array.isArray(raw) ? raw[0] : raw) as { name?: string } | undefined
  return cat?.name || null
}

function getConceptName(style: Style): string | null {
  const raw = style.categories
  if (!raw) return null
  const cat = (Array.isArray(raw) ? raw[0] : raw) as { concepts?: unknown } | undefined
  if (!cat?.concepts) return null
  const concepts = cat.concepts
  const concept = (Array.isArray(concepts) ? concepts[0] : concepts) as { name?: string } | undefined
  return concept?.name || null
}

export default function SpecificationView({ styles }: { styles: Style[] }) {
  const { conceptId, categoryId, conceptName, categoryName } = useHierarchy()
  const [search, setSearch] = useState('')

  const filtered = styles.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (conceptId && getConceptName(s) !== conceptName) return false
    if (categoryId && getCategoryName(s) !== categoryName) return false
    return true
  })

  return (
    <div>
      {/* Context breadcrumb */}
      {conceptName && (
        <div className="text-sm text-neutral-400 mb-4">
          Filtered: <span className="text-white">{conceptName}</span>
          {categoryName && <> / <span className="text-white">{categoryName}</span></>}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search styles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-12 text-center text-neutral-500 text-sm">
          No styles found.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Style</th>
                <th className="text-left px-4 py-3 font-medium">Material</th>
                <th className="text-left px-4 py-3 font-medium">Gender</th>
                <th className="text-left px-4 py-3 font-medium">Variants</th>
                <th className="text-right px-4 py-3 font-medium">Base Cost</th>
                <th className="text-right px-4 py-3 font-medium">Lead Time</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((style) => (
                <tr key={style.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/styles/${style.id}`} className="font-medium hover:text-neutral-300 transition">
                      {style.name}
                    </Link>
                    {(getConceptName(style) || getCategoryName(style)) && (
                      <div className="text-xs text-neutral-600 mt-0.5">
                        {getConceptName(style)} / {getCategoryName(style)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{style.material || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded">
                      {style.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{style.variants?.length || 0}</td>
                  <td className="px-4 py-3 text-right text-neutral-400 tabular-nums">
                    {style.base_cost != null ? `€${Number(style.base_cost).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-400 tabular-nums">
                    {style.lead_time_days != null ? `${style.lead_time_days}d` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      style.status === 'active'
                        ? 'bg-green-900/50 text-green-300'
                        : style.status === 'development'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {style.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
