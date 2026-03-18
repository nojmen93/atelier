'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useEscapeClose } from '@/lib/useKeyboardSave'

export default function InviteBuyerModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEscapeClose(onClose)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !contactName || !email) return

    setLoading(true)

    try {
      const res = await fetch('/api/admin/buyers/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, contact_name: contactName, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to invite buyer')
        setLoading(false)
        return
      }

      toast.success('Buyer invited successfully')
      onSuccess()
    } catch {
      toast.error('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-6">Invite Buyer</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div>
            <label className="block text-sm font-medium mb-2">Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
            >
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
