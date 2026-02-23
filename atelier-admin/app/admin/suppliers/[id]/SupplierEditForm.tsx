'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Supplier {
  id: string
  name: string
  contact_email: string | null
  moq: number | null
  lead_time_days: number | null
  production_location: string | null
}

export default function SupplierEditForm({ supplier }: { supplier: Supplier }) {
  const [name, setName] = useState(supplier.name)
  const [email, setEmail] = useState(supplier.contact_email || '')
  const [moq, setMoq] = useState(supplier.moq?.toString() || '')
  const [leadTime, setLeadTime] = useState(supplier.lead_time_days?.toString() || '')
  const [location, setLocation] = useState(supplier.production_location || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('suppliers')
      .update({
        name,
        contact_email: email || null,
        moq: moq ? parseInt(moq) : null,
        lead_time_days: leadTime ? parseInt(leadTime) : null,
        production_location: location || null,
      })
      .eq('id', supplier.id)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/suppliers')
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplier.id)

    if (error) {
      alert(error.message)
      setDeleting(false)
    } else {
      router.push('/admin/suppliers')
      router.refresh()
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Edit Supplier</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Supplier Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Contact Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">MOQ</label>
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
            <input
              type="number"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Production Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 text-red-400 border border-red-900 rounded hover:bg-red-900/30 transition"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>
    </>
  )
}
