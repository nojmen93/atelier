import { createClient } from '@/lib/supabase/server'
import SpecificationView from './SpecificationView'

export default async function SpecificationPage() {
  const supabase = await createClient()

  const { data: styles } = await supabase
    .from('styles')
    .select('id, name, material, description, base_cost, lead_time_days, customization_mode, status, gender, collection_type, categories(name, concepts(name)), variants(id, size, color, sku, stock)')
    .neq('status', 'archived')
    .order('name')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Specification</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Technical specifications, measurements, and construction details for all products.
      </p>
      <SpecificationView styles={styles || []} />
    </div>
  )
}
