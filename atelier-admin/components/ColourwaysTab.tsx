'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Colour {
  id: string
  colour_name: string
  colour_code: string
  colour_family_code: string | null
  hex_value: string | null
}

interface StyleColour {
  id: string
  style_id: string
  colour_id: string
  colour: Colour
}

const COLOUR_FAMILIES = [
  { code: 'BLK', label: 'Black' },
  { code: 'WHT', label: 'White' },
  { code: 'GRY', label: 'Grey' },
  { code: 'NVY', label: 'Navy' },
  { code: 'BLU', label: 'Blue' },
  { code: 'RED', label: 'Red' },
  { code: 'GRN', label: 'Green' },
  { code: 'YEL', label: 'Yellow' },
  { code: 'ORG', label: 'Orange' },
  { code: 'PNK', label: 'Pink' },
  { code: 'PUR', label: 'Purple' },
  { code: 'BRN', label: 'Brown' },
  { code: 'BGE', label: 'Beige' },
  { code: 'OTH', label: 'Other' },
]

export default function ColourwaysTab({ styleId }: { styleId: string }) {
  const [allColours, setAllColours] = useState<Colour[]>([])
  const [assignedColourIds, setAssignedColourIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [filterFamily, setFilterFamily] = useState('')

  useEffect(() => {
    loadData()
  }, [styleId])

  const loadData = async () => {
    const [coloursRes, assignedRes] = await Promise.all([
      fetch('/api/colours'),
      fetch(`/api/style-colours?styleId=${styleId}`),
    ])

    if (coloursRes.ok) {
      const data = await coloursRes.json()
      setAllColours(Array.isArray(data) ? data : [])
    }
    if (assignedRes.ok) {
      const assigned = await assignedRes.json()
      const arr: StyleColour[] = Array.isArray(assigned) ? assigned : []
      setAssignedColourIds(new Set(arr.map((a) => a.colour_id)))
    }
    setLoading(false)
  }

  const assignedColours = allColours.filter((c) => assignedColourIds.has(c.id))

  const handleAssign = async (colourId: string) => {
    const res = await fetch('/api/style-colours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style_id: styleId, colour_id: colourId }),
    })

    if (res.ok) {
      setAssignedColourIds((prev) => new Set([...prev, colourId]))
      toast.success('Colour added')
    } else {
      toast.error('Failed to add colour')
    }
  }

  const handleRemove = async (colourId: string) => {
    const res = await fetch('/api/style-colours', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style_id: styleId, colour_id: colourId }),
    })

    if (res.ok) {
      setAssignedColourIds((prev) => {
        const next = new Set(prev)
        next.delete(colourId)
        return next
      })
      toast.success('Colour removed')
    } else {
      toast.error('Failed to remove colour')
    }
  }

  // Filter available colours for picker
  const available = allColours.filter((c) => {
    if (assignedColourIds.has(c.id)) return false
    if (filterFamily && c.colour_family_code !== filterFamily) return false
    if (search) {
      const s = search.toLowerCase()
      return c.colour_name.toLowerCase().includes(s) || c.colour_code.toLowerCase().includes(s)
    }
    return true
  })

  // Group available by family
  const grouped = COLOUR_FAMILIES
    .map((family) => ({
      ...family,
      colours: available.filter((c) => c.colour_family_code === family.code),
    }))
    .filter((g) => g.colours.length > 0)

  if (loading) {
    return <div className="text-neutral-500 text-sm py-8 text-center">Loading colours...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Colourways</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Select colours from the{' '}
            <Link href="/admin/styles/colours" className="text-neutral-400 underline hover:text-white">
              colour library
            </Link>{' '}
            for this product
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowPicker(!showPicker); setSearch(''); setFilterFamily('') }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          {showPicker ? 'Done' : '+ Add Colours'}
        </button>
      </div>

      {/* Assigned Colours */}
      {assignedColours.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg py-12 text-center text-neutral-500 text-sm">
          No colours assigned to this product yet.
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-2.5 font-medium w-10"></th>
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium">Code</th>
                <th className="text-left px-4 py-2.5 font-medium">Family</th>
                <th className="text-left px-4 py-2.5 font-medium">Hex</th>
                <th className="text-right px-4 py-2.5 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {assignedColours.map((colour) => (
                <tr key={colour.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-2.5">
                    <div
                      className="w-6 h-6 rounded border border-neutral-700"
                      style={{ backgroundColor: colour.hex_value || '#333' }}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-white font-medium">{colour.colour_name}</td>
                  <td className="px-4 py-2.5 text-neutral-400 font-mono text-xs">{colour.colour_code}</td>
                  <td className="px-4 py-2.5 text-neutral-500 text-xs">
                    {COLOUR_FAMILIES.find((f) => f.code === colour.colour_family_code)?.label || colour.colour_family_code || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500 font-mono text-xs">{colour.hex_value || '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(colour.id)}
                      className="text-xs text-neutral-500 hover:text-red-400 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Colour Picker */}
      {showPicker && (
        <div className="border border-neutral-700 rounded-lg p-5 space-y-4 bg-neutral-950">
          <h3 className="text-sm font-medium text-neutral-300">Select from Colour Library</h3>

          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colours..."
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm w-64 focus:border-neutral-600 focus:outline-none"
            />
            <select
              value={filterFamily}
              onChange={(e) => setFilterFamily(e.target.value)}
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
            >
              <option value="">All Families</option>
              {COLOUR_FAMILIES.map((f) => (
                <option key={f.code} value={f.code}>{f.label}</option>
              ))}
            </select>
          </div>

          {grouped.length === 0 ? (
            <div className="text-neutral-500 text-sm py-4 text-center">
              {allColours.length === assignedColourIds.size
                ? 'All colours already assigned.'
                : 'No colours match your search.'}
            </div>
          ) : (
            <div className="space-y-5 max-h-[400px] overflow-y-auto">
              {grouped.map((group) => (
                <div key={group.code}>
                  <h4 className="text-xs text-neutral-500 font-medium mb-2">{group.label}</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {group.colours.map((colour) => (
                      <button
                        key={colour.id}
                        type="button"
                        onClick={() => handleAssign(colour.id)}
                        className="text-left border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-500 transition group/item"
                      >
                        <div
                          className="h-10 w-full"
                          style={{ backgroundColor: colour.hex_value || '#333' }}
                        />
                        <div className="px-2 py-1.5">
                          <div className="text-xs text-white truncate">{colour.colour_name}</div>
                          <div className="text-[10px] text-neutral-600 font-mono">{colour.colour_code}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-neutral-600">
        {assignedColours.length} colour{assignedColours.length !== 1 ? 's' : ''} assigned
      </div>
    </div>
  )
}
