'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import BackLink from '@/components/BackLink'

interface ExportData {
  viewName: string
  headers: string[]
  rows: string[][]
  exportOptions: {
    header_text: string
    page_size: 'a4' | 'letter'
    include_images: boolean
    include_header: boolean
  }
}

export default function ExportViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const ids = searchParams.get('ids') || ''

  const [data, setData] = useState<ExportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const url = `/api/views/${id}/export${ids ? `?ids=${ids}` : ''}`
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setData(json)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, ids])

  async function handleDownload() {
    if (!data) return
    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: data.exportOptions.page_size,
      })

      let startY = 10

      if (data.exportOptions.include_header && data.exportOptions.header_text) {
        doc.setFontSize(14)
        doc.setTextColor(255, 255, 255)
        doc.text(data.exportOptions.header_text, 14, startY)
        startY += 10
      }

      autoTable(doc, {
        head: [data.headers],
        body: data.rows,
        startY,
        headStyles: { fillColor: [10, 10, 10], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: [200, 200, 200], fillColor: [20, 20, 20] },
        alternateRowStyles: { fillColor: [30, 30, 30] },
      })

      doc.save(`${data.viewName}-export.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  const selectedCount = ids ? ids.split(',').filter(Boolean).length : 0

  return (
    <div className="max-w-4xl">
      <BackLink href={`/admin/views/${id}/render`} label="Back to View" />
      <h1 className="text-3xl font-bold mb-2">
        Export{data ? `: ${data.viewName}` : ''}
      </h1>
      <p className="text-neutral-500 mb-8">
        {selectedCount > 0
          ? `${selectedCount} style${selectedCount !== 1 ? 's' : ''} selected for export`
          : 'All styles in this view will be exported'}
      </p>

      {loading && (
        <div className="border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">Loading export data…</p>
        </div>
      )}

      {error && (
        <div className="border border-red-900 rounded-lg p-6 text-red-400">
          Error: {error}
        </div>
      )}

      {data && (
        <>
          <div className="border border-neutral-800 rounded-lg p-6 space-y-4 mb-6">
            <h2 className="text-lg font-semibold">Export Settings</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Page Size</span>
                <p>{data.exportOptions.page_size === 'a4' ? 'A4' : 'Letter'}</p>
              </div>
              <div>
                <span className="text-neutral-500">Header Text</span>
                <p>{data.exportOptions.header_text || '(none)'}</p>
              </div>
              <div>
                <span className="text-neutral-500">Include Images</span>
                <p>{data.exportOptions.include_images ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-neutral-500">Include Header</span>
                <p>{data.exportOptions.include_header ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="border border-neutral-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Data Preview{' '}
              <span className="text-neutral-500 text-sm font-normal">
                ({data.rows.length} rows — showing first 5)
              </span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    {data.headers.map((h, i) => (
                      <th key={i} className="text-left py-2 px-3 text-neutral-400 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 5).map((row, ri) => (
                    <tr key={ri} className="border-b border-neutral-900 hover:bg-neutral-900/50">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 text-neutral-300 whitespace-nowrap max-w-[180px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={generating}
            className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating PDF…' : 'Download PDF'}
          </button>
        </>
      )}
    </div>
  )
}
