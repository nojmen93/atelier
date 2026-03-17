import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getBuyer() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: buyer } = await supabase
    .from('buyers')
    .select('id, contact_name, company_name')
    .eq('user_id', user.id)
    .single()

  if (!buyer) {
    redirect('/access-pending')
  }

  return { supabase, buyer }
}
