'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NewQuoteModal from '@/components/NewQuoteModal'

export default function QuoteEmptyState() {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quote Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          New Quote
        </button>
      </div>

      <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h3 className="text-lg font-semibold text-neutral-300 mb-2">No quote requests yet</h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
          Quote requests from customers will appear here. You can also create one manually.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          Create First Quote
        </button>
      </div>

      {showModal && (
        <NewQuoteModal
          onClose={() => { setShowModal(false); router.refresh() }}
          onQuoteCreated={() => router.refresh()}
        />
      )}
    </div>
  )
}
