'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewSupplierPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [moq, setMoq] = useState('')
  const [leadTime, setLeadTime] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('suppliers').insert({
      name,
      contact_email: email || null,
      moq: moq ? parseInt(moq) : null,
      lead_time_days: leadTime ? parseInt(leadTime) : null,
      production_location: location || null,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/suppliers')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">New Supplier</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Supplier Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Contact Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">MOQ</label>
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
            <input
              type="number"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Production Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          {loading ? 'Creating...' : 'Create Supplier'}
        </button>
      </form>
    </div>
  )
}
