'use client'

import { useState, useRef, useEffect } from 'react'
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

// GS1 US (formerly NRF) Standard Color Code ranges
// 3-digit codes assigned by colour family per industry standard
const COLOUR_FAMILIES: { code: string; label: string; gs1RangeStart: number }[] = [
  { code: 'BLK', label: 'Black',  gs1RangeStart: 0 },    // 000–019
  { code: 'GRY', label: 'Grey',   gs1RangeStart: 20 },   // 020–049
  { code: 'WHT', label: 'White',  gs1RangeStart: 50 },   // 050–099
  { code: 'BRN', label: 'Brown',  gs1RangeStart: 100 },  // 100–149
  { code: 'BGE', label: 'Beige',  gs1RangeStart: 150 },  // 150–199
  { code: 'GRN', label: 'Green',  gs1RangeStart: 300 },  // 300–399
  { code: 'NVY', label: 'Navy',   gs1RangeStart: 400 },  // 400–424
  { code: 'BLU', label: 'Blue',   gs1RangeStart: 425 },  // 425–499
  { code: 'PUR', label: 'Purple', gs1RangeStart: 500 },  // 500–599
  { code: 'RED', label: 'Red',    gs1RangeStart: 600 },  // 600–699
  { code: 'PNK', label: 'Pink',   gs1RangeStart: 700 },  // 700–799
  { code: 'YEL', label: 'Yellow', gs1RangeStart: 800 },  // 800–849
  { code: 'ORG', label: 'Orange', gs1RangeStart: 850 },  // 850–899
  { code: 'OTH', label: 'Other',  gs1RangeStart: 900 },  // 900–999
]

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

function getNextColourCode(familyCode: string, existingColours: Colour[]): string {
  const familyColours = existingColours.filter((c) => c.colour_family_code === familyCode)
  const existingNums = familyColours
    .map((c) => {
      const match = c.colour_code.match(/-(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter((n) => !isNaN(n))

  const next = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1
  return `${familyCode}-${String(next).padStart(3, '0')}`
}

function getNextGS1Code(familyCode: string, existingColours: Colour[]): string {
  const family = COLOUR_FAMILIES.find((f) => f.code === familyCode)
  if (!family) return '900'

  const familyColours = existingColours.filter((c) => c.colour_family_code === familyCode)
  const existingGs1 = familyColours
    .map((c) => {
      if (!c.g1_code) return NaN
      const num = parseInt(c.g1_code)
      return isNaN(num) ? NaN : num
    })
    .filter((n) => !isNaN(n))

  const next = existingGs1.length > 0
    ? Math.max(...existingGs1) + 1
    : family.gs1RangeStart + 1

  return String(next).padStart(3, '0')
}

function ColourCardMenu({ onDelete }: { onDelete: () => void }) {
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
    <div ref={ref} className="relative mt-2 opacity-0 group-hover:opacity-100 transition">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-300 rounded hover:bg-neutral-800 transition"
        aria-label="More actions"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[100px] bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1">
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-neutral-800 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function ColourLibrary({ initialColours }: { initialColours: Colour[] }) {
  const [colours, setColours] = useState(initialColours)
  const [showForm, setShowForm] = useState(false)
  const [filterFamily, setFilterFamily] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Form state
  const [colourName, setColourName] = useState('')
  const [colourFamilyCode, setColourFamilyCode] = useState('')
  const [hexValue, setHexValue] = useState('#000000')

  const resetForm = () => {
    setColourName('')
    setColourFamilyCode('')
    setHexValue('#000000')
    setShowForm(false)
  }

  const handleFamilyChange = (code: string) => {
    setColourFamilyCode(code)
  }

  const handleSave = async () => {
    if (!colourName || !colourFamilyCode) {
      toast.error('Colour name and family are required')
      return
    }

    const colourCode = getNextColourCode(colourFamilyCode, colours)
    const g1Code = getNextGS1Code(colourFamilyCode, colours)

    const res = await fetch('/api/colours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        colour_name: colourName,
        colour_code: colourCode,
        colour_family_code: colourFamilyCode,
        hex_value: hexValue || null,
        g1_code: g1Code,
      }),
    })

    if (res.ok) {
      toast.success('Colour added to library')
      resetForm()
      router.refresh()
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
      return c.colour_name.toLowerCase().includes(s) || c.colour_code.toLowerCase().includes(s)
    }
    return true
  })

  // Preview auto-codes
  const previewColourCode = colourFamilyCode ? getNextColourCode(colourFamilyCode, colours) : '—'
  const previewGS1Code = colourFamilyCode ? getNextGS1Code(colourFamilyCode, colours) : '—'

  // Group by family
  const grouped = COLOUR_FAMILIES
    .map((family) => ({
      ...family,
      colours: filtered.filter((c) => c.colour_family_code === family.code),
    }))

  const displayGrouped = filterFamily || search
    ? grouped.filter((g) => g.colours.length > 0)
    : grouped.filter((g) => g.colours.length > 0 || true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colour Library</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Global colour reference for all products &mdash; codes auto-generated per{' '}
            <span className="text-neutral-400">GS1 US</span> standard
          </p>
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
              <label className="block text-xs text-neutral-500 mb-1">Colour Family *</label>
              <select
                value={colourFamilyCode}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Select family...</option>
                {COLOUR_FAMILIES.map((f) => (
                  <option key={f.code} value={f.code}>{f.label}</option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Auto-generated code preview */}
          {colourFamilyCode && (
            <div className="flex gap-6 py-2 px-3 bg-neutral-900/50 rounded border border-neutral-800/50">
              <div>
                <span className="text-xs text-neutral-500">Colour Code</span>
                <div className="text-sm text-white font-mono">{previewColourCode}</div>
              </div>
              <div>
                <span className="text-xs text-neutral-500">GS1 US Code</span>
                <div className="text-sm text-white font-mono">{previewGS1Code}</div>
              </div>
              <div className="text-xs text-neutral-600 self-end">Auto-generated from family</div>
            </div>
          )}

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
      {displayGrouped.filter((g) => g.colours.length > 0).length === 0 ? (
        <div className="text-neutral-500 text-sm py-12 text-center border border-neutral-800 border-dashed rounded-lg">
          {colours.length === 0 ? 'No colours in the library yet.' : 'No colours match your search.'}
        </div>
      ) : (
        <div className="space-y-8">
          {displayGrouped.map((group) => (
            group.colours.length === 0 ? null : (
              <div key={group.code}>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">
                  {group.label}
                  <span className="text-neutral-600 ml-2 text-xs font-normal">
                    GS1 range: {String(group.gs1RangeStart).padStart(3, '0')}+
                  </span>
                </h3>
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
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-neutral-500 font-mono">{colour.colour_code}</span>
                          {colour.g1_code && (
                            <span className="text-[10px] text-neutral-600 font-mono bg-neutral-900 px-1.5 py-0.5 rounded">
                              GS1: {colour.g1_code}
                            </span>
                          )}
                        </div>
                        <ColourCardMenu onDelete={() => handleDelete(colour.id, colour.colour_name)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* GS1 Reference */}
      <div className="border border-neutral-800 rounded-lg p-4 mt-8">
        <h3 className="text-xs font-medium text-neutral-400 mb-2">GS1 US Colour Code Reference</h3>
        <p className="text-xs text-neutral-600 mb-3">
          GS1 US (formerly NRF) Standard Color Codes are 3-digit identifiers used across US retail for EDI
          purchase orders. Codes are auto-assigned within each family&apos;s designated range.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-xs">
          {COLOUR_FAMILIES.map((f) => (
            <div key={f.code} className="text-neutral-500">
              <span className="text-neutral-400">{f.label}:</span>{' '}
              <span className="font-mono">{String(f.gs1RangeStart).padStart(3, '0')}+</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-neutral-600 pt-2">
        {colours.length} colour{colours.length !== 1 ? 's' : ''} in library
      </div>
    </div>
  )
}
