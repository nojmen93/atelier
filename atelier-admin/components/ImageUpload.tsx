'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'product-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

interface UploadingFile {
  id: string
  name: string
  progress: number
  preview: string
}

export default function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const id = crypto.randomUUID()
    const preview = URL.createObjectURL(file)

    setUploading((prev) => [...prev, { id, name: file.name, progress: 0, preview }])

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    // Simulate progress since supabase-js doesn't expose upload progress
    setUploading((prev) =>
      prev.map((u) => (u.id === id ? { ...u, progress: 100 } : u))
    )

    if (error) {
      alert(`Upload failed: ${error.message}`)
      setUploading((prev) => prev.filter((u) => u.id !== id))
      URL.revokeObjectURL(preview)
      return null
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setUploading((prev) => prev.filter((u) => u.id !== id))
    URL.revokeObjectURL(preview)

    return urlData.publicUrl
  }, [supabase])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const invalid = files.filter(
      (f) => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_SIZE
    )
    if (invalid.length > 0) {
      alert(
        `Some files were skipped. Accepted: JPG, PNG, WebP under 5MB.\nSkipped: ${invalid.map((f) => f.name).join(', ')}`
      )
    }

    const valid = files.filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE
    )

    const urls: string[] = []
    for (const file of valid) {
      const url = await uploadFile(file)
      if (url) urls.push(url)
    }

    if (urls.length > 0) {
      onImagesChange([...images, ...urls])
    }

    // Reset input so the same files can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
  }

  const handleDragStart = (index: number) => {
    setDragSourceIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragSourceIndex === null || dragSourceIndex === index) return
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragSourceIndex === null || dragSourceIndex === dropIndex) {
      setDragOverIndex(null)
      setDragSourceIndex(null)
      return
    }

    const updated = [...images]
    const [moved] = updated.splice(dragSourceIndex, 1)
    updated.splice(dropIndex, 0, moved)
    onImagesChange(updated)

    setDragOverIndex(null)
    setDragSourceIndex(null)
  }

  const handleDragEnd = () => {
    setDragOverIndex(null)
    setDragSourceIndex(null)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Product Images</label>

      {/* Image grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${
                dragOverIndex === index
                  ? 'border-white scale-105'
                  : dragSourceIndex === index
                    ? 'border-neutral-600 opacity-50'
                    : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white text-black rounded">
                  Primary
                </span>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>

              {/* Order indicator */}
              <span className="absolute bottom-2 left-2 w-6 h-6 flex items-center justify-center text-[10px] font-medium bg-black/70 text-neutral-300 rounded">
                {index + 1}
              </span>
            </div>
          ))}

          {/* Uploading previews */}
          {uploading.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-700"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-1 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-400 mt-2">Uploading...</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading.length > 0}
        className="w-full py-8 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-50"
      >
        <div className="flex flex-col items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
          </svg>
          <span className="text-sm">
            {images.length === 0
              ? 'Upload images'
              : 'Add more images'}
          </span>
          <span className="text-xs text-neutral-600">JPG, PNG, WebP — max 5MB each</span>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 1 && (
        <p className="text-xs text-neutral-600 mt-2">
          Drag images to reorder. First image is the primary product image.
        </p>
      )}
    </div>
  )
}
