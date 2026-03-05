'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted to Order' },
]

const STATUS_BADGES: Record<string, string> = {
  new: 'bg-blue-900/50 border-blue-700 text-blue-200',
  reviewed: 'bg-yellow-900/50 border-yellow-700 text-yellow-200',
  quoted: 'bg-purple-900/50 border-purple-700 text-purple-200',
  accepted: 'bg-green-900/50 border-green-700 text-green-200',
  rejected: 'bg-red-900/50 border-red-700 text-red-200',
  converted: 'bg-emerald-900/50 border-emerald-700 text-emerald-200',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  quoted: 'Quoted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  converted: 'Converted',
}

interface Quote {
  id: string
  customer_name: string
  customer_email: string
  customer_company: string | null
  quantity: number
  status: string
  quoted_price: number | null
  product_name: string | null
  created_at: string
  styles: { name: string; images: string[] | null } | null
}

export default function QuoteList({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = initialQuotes.filter((q) => {
    if (statusFilter && q.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      const matchesName = q.customer_name.toLowerCase().includes(s)
      const matchesEmail = q.customer_email.toLowerCase().includes(s)
      const matchesCompany = q.customer_company?.toLowerCase().includes(s)
      if (!matchesName && !matchesEmail && !matchesCompany) return false
    }
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-neutral-500 mb-4">
        {filtered.length} quote{filtered.length !== 1 ? 's' : ''}
        {statusFilter && ` · ${STATUS_LABELS[statusFilter] || statusFilter}`}
        {search && ` · matching "${search}"`}
      </p>

      {/* Table */}
      <div className="border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Quoted</th>
              <th className="text-right px-4 py-3 font-medium w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-neutral-500">
                  No quotes match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50 transition">
                  <td className="px-4 py-3 text-neutral-400 tabular-nums">
                    {new Date(q.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{q.customer_name}</div>
                    <div className="text-xs text-neutral-500">{q.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {q.customer_company || <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {q.styles?.name || q.product_name || <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-300">
                    {q.quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded border ${STATUS_BADGES[q.status] || 'bg-neutral-800 border-neutral-700 text-neutral-300'}`}>
                      {STATUS_LABELS[q.status] || q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-300">
                    {q.quoted_price ? `€${Number(q.quoted_price).toFixed(2)}` : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/quotes/${q.id}`}
                      className="px-3 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-700 rounded hover:border-neutral-500 transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
