'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Colour {
  id: string
  colour_name: string
  colour_code: string
  colour_family_code: string | null
  hex_value: string | null
  g1_code: string | null
  created_at: string
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

const inputClass = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none'

export default function ColourwaysTab() {
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterFamily, setFilterFamily] = useState('')
  const [search, setSearch] = useState('')

  // Form state
  const [colourName, setColourName] = useState('')
  const [colourCode, setColourCode] = useState('')
  const [colourFamilyCode, setColourFamilyCode] = useState('')
  const [hexValue, setHexValue] = useState('#000000')
  const [g1Code, setG1Code] = useState('')

  useEffect(() => {
    fetchColours()
  }, [])

  const fetchColours = async () => {
    const res = await fetch('/api/colours')
    if (res.ok) {
      setColours(await res.json())
    }
    setLoading(false)
  }

  const resetForm = () => {
    setColourName('')
    setColourCode('')
    setColourFamilyCode('')
    setHexValue('#000000')
    setG1Code('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (colour: Colour) => {
    setColourName(colour.colour_name)
    setColourCode(colour.colour_code)
    setColourFamilyCode(colour.colour_family_code || '')
    setHexValue(colour.hex_value || '#000000')
    setG1Code(colour.g1_code || '')
    setEditingId(colour.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!colourName || !colourCode) {
      toast.error('Colour name and code are required')
      return
    }

    const payload = {
      colour_name: colourName,
      colour_code: colourCode,
      colour_family_code: colourFamilyCode || null,
      hex_value: hexValue || null,
      g1_code: g1Code || null,
    }

    const res = editingId
      ? await fetch('/api/colours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch('/api/colours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    if (res.ok) {
      toast.success(editingId ? 'Colour updated' : 'Colour added')
      resetForm()
      fetchColours()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/colours', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      toast.success('Colour deleted')
      fetchColours()
    } else {
      toast.error('Failed to delete')
    }
  }

  const filtered = colours.filter((c) => {
    if (filterFamily && c.colour_family_code !== filterFamily) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        c.colour_name.toLowerCase().includes(s) ||
        c.colour_code.toLowerCase().includes(s) ||
        (c.g1_code && c.g1_code.toLowerCase().includes(s))
      )
    }
    return true
  })

  if (loading) {
    return <div className="text-neutral-500 text-sm py-8 text-center">Loading colour library...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Colour Library</h2>
          <p className="text-xs text-neutral-500 mt-1">Global colour reference — not style-specific</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
        >
          + Add Colour
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border border-neutral-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300">
            {editingId ? 'Edit Colour' : 'New Colour'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Name *</label>
              <input
                type="text"
                value={colourName}
                onChange={(e) => setColourName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Midnight Navy"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Code *</label>
              <input
                type="text"
                value={colourCode}
                onChange={(e) => setColourCode(e.target.value)}
                className={inputClass}
                placeholder="e.g. MN-001"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Colour Family</label>
              <select
                value={colourFamilyCode}
                onChange={(e) => setColourFamilyCode(e.target.value)}
                className={inputClass}
              >
                <option value="">Select family...</option>
                {COLOUR_FAMILIES.map((f) => (
                  <option key={f.code} value={f.code}>{f.label} ({f.code})</option>
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
                  className="w-10 h-10 rounded border border-neutral-800 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={hexValue}
                  onChange={(e) => setHexValue(e.target.value)}
                  className={inputClass}
                  placeholder="#000000"
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
                placeholder="e.g. G1-NVY-042"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              {editingId ? 'Update' : 'Save'}
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

      {/* Colour Table */}
      {filtered.length === 0 ? (
        <div className="text-neutral-500 text-sm py-8 text-center">
          {colours.length === 0 ? 'No colours in the library yet.' : 'No colours match your filter.'}
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Colour</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Family</th>
                <th className="text-left px-4 py-3 font-medium">Hex</th>
                <th className="text-left px-4 py-3 font-medium">G1 Code</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((colour) => (
                <tr key={colour.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div
                      className="w-8 h-8 rounded border border-neutral-700"
                      style={{ backgroundColor: colour.hex_value || '#333' }}
                    />
                  </td>
                  <td className="px-4 py-3 text-white">{colour.colour_name}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{colour.colour_code}</td>
                  <td className="px-4 py-3 text-neutral-400">
                    {COLOUR_FAMILIES.find((f) => f.code === colour.colour_family_code)?.label || colour.colour_family_code || '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{colour.hex_value || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{colour.g1_code || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEdit(colour)}
                      className="text-neutral-500 hover:text-white text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(colour.id)}
                      className="text-neutral-500 hover:text-red-400 text-xs"
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

      <div className="text-xs text-neutral-600">
        {filtered.length} colour{filtered.length !== 1 ? 's' : ''} in library
      </div>
    </div>
  )
}
