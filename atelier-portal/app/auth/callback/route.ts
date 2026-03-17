import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if the user has a buyers row
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: buyer } = await supabase
          .from('buyers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (buyer) {
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/access-pending`)
        }
      }
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
