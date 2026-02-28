'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BackLink from '@/components/BackLink'

const ACCEPTED_EXTENSIONS = ['.svg', '.ai', '.eps', '.png']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function NewLogoPage() {
  const [companyName, setCompanyName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setError(null)
    setPreview(null)
    setDimensions(null)

    if (!selected) {
      setFile(null)
      return
    }

    const ext = selected.name.split('.').pop()?.toLowerCase()
    if (!ext || !['svg', 'ai', 'eps', 'png'].includes(ext)) {
      setError('Invalid file type. Accepted: SVG, AI, EPS, PNG')
      setFile(null)
      return
    }

    if (selected.size > MAX_SIZE) {
      setError('File too large. Max 10MB')
      setFile(null)
      return
    }

    setFile(selected)

    // Generate preview for PNG and SVG
    if (ext === 'png' || ext === 'svg') {
      const url = URL.createObjectURL(selected)
      setPreview(url)

      // Extract dimensions
      const img = new Image()
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !companyName.trim()) return

    setUploading(true)
    setProgress(10)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('company_name', companyName.trim())

      setProgress(30)

      const res = await fetch('/api/logos/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        setUploading(false)
        setProgress(0)
        return
      }

      setProgress(100)
      router.push('/admin/logos')
      router.refresh()
    } catch {
      setError('Upload failed. Please try again.')
      setUploading(false)
      setProgress(0)
    }
  }

  const ext = file?.name.split('.').pop()?.toLowerCase()

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/logos" label="Back to Logos" />
      <h1 className="text-3xl font-bold mb-8">Upload New Logo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Acme Corp"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-neutral-700 rounded-lg p-12 text-center hover:border-neutral-500 transition"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-neutral-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-neutral-400 text-sm">Click to select a logo file</p>
              <p className="text-neutral-600 text-xs mt-1">SVG, AI, EPS, or PNG - Max 10MB</p>
            </button>
          ) : (
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              {preview ? (
                <div className="bg-neutral-900 p-8 flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <img src={preview} alt="Preview" className="max-w-full max-h-48 object-contain" />
                </div>
              ) : (
                <div className="bg-neutral-900 p-8 flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-neutral-600">{ext?.toUpperCase()}</span>
                    <p className="text-xs text-neutral-600 mt-2">Preview not available for this format</p>
                  </div>
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</span>
                    <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded">{ext?.toUpperCase()}</span>
                    {dimensions && (
                      <span className="text-xs text-neutral-500">{dimensions.width} x {dimensions.height} px</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    setDimensions(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-900/30 border border-red-900 rounded text-sm text-red-300">
            {error}
          </div>
        )}

        {uploading && (
          <div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Uploading...</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file || !companyName.trim()}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </button>
      </form>
    </div>
  )
}
