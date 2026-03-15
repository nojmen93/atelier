import { createClient } from '@/lib/supabase/server'
import ProductPage from '@/components/ProductPage'

export default async function StylesPage() {
  const supabase = await createClient()

  const { data: styles } = await supabase
    .from('styles')
    .select('*, categories(name, concepts(name)), variants(id)')
    .order('display_order', { ascending: true })

  return <ProductPage initialStyles={styles || []} />
}
