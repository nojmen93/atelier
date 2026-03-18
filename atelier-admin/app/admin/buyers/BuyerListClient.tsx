'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import InviteBuyerModal from './InviteBuyerModal'

interface Buyer {
  id: string
  company_name: string
  contact_name: string
  email: string
  created_at: string
  style_count: number
}

export default function BuyerListClient({ buyers }: { buyers: Buyer[] }) {
  const [showInvite, setShowInvite] = useState(false)
  const router = useRouter()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buyers</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          Invite Buyer
        </button>
      </div>

      {buyers.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v-2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No buyers yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Invite buyers to give them access to your product catalog and ordering portal.</p>
          <button
            onClick={() => setShowInvite(true)}
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Invite First Buyer
          </button>
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Company</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-right px-4 py-3 font-medium">Styles</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/buyers/${buyer.id}`} className="font-medium text-neutral-200 hover:text-white transition">
                      {buyer.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{buyer.contact_name}</td>
                  <td className="px-4 py-3 text-neutral-400">{buyer.email}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-400">{buyer.style_count}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs tabular-nums">
                    {new Date(buyer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <InviteBuyerModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
