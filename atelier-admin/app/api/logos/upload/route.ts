import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const BUCKET = 'logos'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_EXTENSIONS = ['svg', 'ai', 'eps', 'png']
const ACCEPTED_MIME_TYPES = [
  'image/svg+xml',
  'image/png',
  'application/postscript',      // .ai, .eps
  'application/illustrator',     // .ai
  'application/eps',             // .eps
  'application/x-eps',           // .eps
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const companyName = formData.get('company_name') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: 'Invalid file type. Accepted: SVG, AI, EPS, PNG' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Max 10MB' },
      { status: 400 }
    )
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const path = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET)
    .upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = serviceClient.storage
    .from(BUCKET)
    .getPublicUrl(path)

  // Extract dimensions for PNG and SVG
  let width: number | null = null
  let height: number | null = null

  if (ext === 'png') {
    try {
      const metadata = await sharp(buffer).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null
    } catch {
      // Dimension extraction failed — continue without
    }
  } else if (ext === 'svg') {
    try {
      const svgText = buffer.toString('utf-8')
      const widthMatch = svgText.match(/width="(\d+(?:\.\d+)?)/)
      const heightMatch = svgText.match(/height="(\d+(?:\.\d+)?)/)
      if (widthMatch) width = Math.round(parseFloat(widthMatch[1]))
      if (heightMatch) height = Math.round(parseFloat(heightMatch[1]))
      if (!width || !height) {
        const viewBoxMatch = svgText.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/)
        if (viewBoxMatch) {
          width = width || Math.round(parseFloat(viewBoxMatch[1]))
          height = height || Math.round(parseFloat(viewBoxMatch[2]))
        }
      }
    } catch {
      // SVG parsing failed — continue without dimensions
    }
  }

  const fileFormat = ext.toUpperCase()

  // Insert into logos table
  const { data: logo, error: insertError } = await serviceClient
    .from('logos')
    .insert({
      company_name: companyName.trim(),
      file_url: urlData.publicUrl,
      file_format: fileFormat,
      width,
      height,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ logo })
}
