import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  // Verify admin is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { company_name, contact_name, email } = await req.json()
  if (!company_name || !contact_name || !email) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Invite user via Supabase Auth
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email)

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Create buyer row
  const { error: buyerError } = await admin
    .from('buyers')
    .insert({
      user_id: inviteData.user.id,
      company_name,
      contact_name,
      email,
    })

  if (buyerError) {
    return NextResponse.json({ error: buyerError.message }, { status: 500 })
  }

  await logAudit({
    action: 'buyer_invited',
    entityType: 'buyer',
    entityName: company_name,
    userId: user.id,
    metadata: { email },
  })

  return NextResponse.json({ success: true })
}
