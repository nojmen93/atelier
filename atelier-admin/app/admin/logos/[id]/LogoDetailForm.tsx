'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardSave } from '@/lib/useKeyboardSave'

interface Logo {
  id: string
  company_name: string
  file_url: string
  file_format: string
  width: number | null
  height: number | null
  created_at: string
}

export default function LogoDetailForm({ logo }: { logo: Logo }) {
  const [companyName, setCompanyName] = useState(logo.company_name)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useKeyboardSave(useCallback(() => {
    const form = document.querySelector('form')
    form?.requestSubmit()
  }, []))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('logos')
      .update({ company_name: companyName.trim() })
      .eq('id', logo.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Changes saved")
      router.push("/admin/logos")
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('logos')
      .delete()
      .eq('id', logo.id)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success("Logo deleted")
      router.push("/admin/logos")
      router.refresh()
    }
  }

  const canPreview = logo.file_format === 'PNG' || logo.file_format === 'SVG'

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Logo Details</h1>

      {/* Logo preview */}
      <div className="border border-neutral-800 rounded-lg overflow-hidden mb-8">
        <div className="bg-neutral-900 p-12 flex items-center justify-center" style={{ minHeight: '300px' }}>
          {canPreview ? (
            <img
              src={logo.file_url}
              alt={logo.company_name}
              className="max-w-full max-h-64 object-contain"
            />
          ) : (
            <div className="text-center">
              <span className="text-4xl font-bold text-neutral-600">{logo.file_format}</span>
              <p className="text-sm text-neutral-600 mt-2">Preview not available for this format</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
        <div>
          <span className="block text-neutral-500 mb-1">Format</span>
          <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded">{logo.file_format}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Dimensions</span>
          <span className="text-neutral-300">
            {logo.width && logo.height ? `${logo.width} x ${logo.height} px` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Uploaded</span>
          <span className="text-neutral-300">{new Date(logo.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">File URL</span>
          <a
            href={logo.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition text-xs underline"
          >
            Open file
          </a>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || !companyName.trim()}
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
              <span className="text-sm text-red-400">Delete this logo?</span>
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
