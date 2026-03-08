'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Colour {
  id: string
  colour_name: string
  colour_code: string
  colour_family_code: string | null
  hex_value: string | null
  g1_code: string | null
  created_at: string
}

const COLOUR_FAMILIES: { code: string; label: string }[] = [
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

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

export default function ColourLibrary({ initialColours }: { initialColours: Colour[] }) {
  const [colours, setColours] = useState(initialColours)
  const [showForm, setShowForm] = useState(false)
  const [filterFamily, setFilterFamily] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Form state
  const [colourName, setColourName] = useState('')
  const [colourCode, setColourCode] = useState('')
  const [colourFamilyCode, setColourFamilyCode] = useState('')
  const [hexValue, setHexValue] = useState('#000000')
  const [g1Code, setG1Code] = useState('')

  const resetForm = () => {
    setColourName('')
    setColourCode('')
    setColourFamilyCode('')
    setHexValue('#000000')
    setG1Code('')
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!colourName || !colourCode || !colourFamilyCode) {
      toast.error('Colour name, code, and family are required')
      return
    }

    const res = await fetch('/api/colours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        colour_name: colourName,
        colour_code: colourCode,
        colour_family_code: colourFamilyCode,
        hex_value: hexValue || null,
        g1_code: g1Code || null,
      }),
    })

    if (res.ok) {
      toast.success('Colour added to library')
      resetForm()
      router.refresh()
      // Also refresh local state
      const refreshRes = await fetch('/api/colours')
      if (refreshRes.ok) setColours(await refreshRes.json())
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to add colour')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from colour library?`)) return

    const res = await fetch('/api/colours', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      toast.success('Colour deleted')
      setColours((prev) => prev.filter((c) => c.id !== id))
    } else {
      toast.error('Failed to delete colour')
    }
  }

  const filtered = colours.filter((c) => {
    if (filterFamily && c.colour_family_code !== filterFamily) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        c.colour_name.toLowerCase().includes(s) ||
        c.colour_code.toLowerCase().includes(s)
      )
    }
    return true
  })

  // Group by family
  const grouped = COLOUR_FAMILIES
    .map((family) => ({
      ...family,
      colours: filtered.filter((c) => c.colour_family_code === family.code),
    }))
    .filter((g) => g.colours.length > 0 || (!filterFamily && !search))

  const displayGrouped = filterFamily || search
    ? grouped.filter((g) => g.colours.length > 0)
    : grouped

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colour Library</h1>
          <p className="text-sm text-neutral-500 mt-1">Global colour reference for all products</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + Add Colour
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">New Colour</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Name *</label>
              <input
                type="text"
                value={colourName}
                onChange={(e) => setColourName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Midnight Cosmos"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Code *</label>
              <input
                type="text"
                value={colourCode}
                onChange={(e) => setColourCode(e.target.value)}
                className={inputClass}
                placeholder="e.g. NVY-003"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Family *</label>
              <select
                value={colourFamilyCode}
                onChange={(e) => setColourFamilyCode(e.target.value)}
                className={inputClass}
              >
                <option value="">Select family...</option>
                {COLOUR_FAMILIES.map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Hex Value</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={hexValue}
                  onChange={(e) => setHexValue(e.target.value)}
                  className="w-10 h-[38px] rounded border border-neutral-800 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={hexValue}
                  onChange={(e) => setHexValue(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">G1 Code (US)</label>
              <input
                type="text"
                value={g1Code}
                onChange={(e) => setG1Code(e.target.value)}
                className={inputClass}
                placeholder="e.g. G1-NVY-003"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              Add to Library
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
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

      {/* Colour Grid by Family */}
      {displayGrouped.length === 0 ? (
        <div className="text-neutral-500 text-sm py-12 text-center border border-neutral-800 border-dashed rounded-lg">
          No colours match your search.
        </div>
      ) : (
        <div className="space-y-8">
          {displayGrouped.map((group) => (
            <div key={group.code}>
              <h3 className="text-sm font-medium text-neutral-400 mb-3">{group.label}</h3>
              {group.colours.length === 0 ? (
                <div className="text-xs text-neutral-600 py-3">No colours in this family yet</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.colours.map((colour) => (
                    <div
                      key={colour.id}
                      className="group border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition"
                    >
                      <div
                        className="h-20 w-full"
                        style={{ backgroundColor: colour.hex_value || '#333' }}
                      />
                      <div className="px-3 py-2.5">
                        <div className="text-sm text-white font-medium">{colour.colour_name}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">{colour.colour_code}</div>
                        {colour.hex_value && (
                          <div className="text-xs text-neutral-600 font-mono mt-0.5">{colour.hex_value}</div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(colour.id, colour.colour_name)}
                          className="text-xs text-neutral-600 hover:text-red-400 mt-2 opacity-0 group-hover:opacity-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-neutral-600 pt-4">
        {colours.length} colour{colours.length !== 1 ? 's' : ''} in library
      </div>
    </div>
  )
}
