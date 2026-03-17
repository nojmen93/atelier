import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (buyer) {
    redirect('/dashboard')
  } else {
    redirect('/access-pending')
  }
}
