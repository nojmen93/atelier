import { createAdminClient } from '@/lib/supabase/admin'
import ColourLibrary from './ColourLibrary'

export const dynamic = 'force-dynamic'

export default async function ColoursPage() {
  const supabase = createAdminClient()

  const { data: colours } = await supabase
    .from('colours')
    .select('*')
    .order('colour_family_code', { ascending: true })
    .order('colour_name', { ascending: true })

  return (
    <div>
      <ColourLibrary initialColours={colours || []} />
    </div>
  )
}
