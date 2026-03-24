import { createAdminClient } from '@/lib/supabase/admin'

type AuditAction =
  | 'style_created' | 'style_updated' | 'style_archived'
  | 'supplier_created' | 'supplier_updated' | 'supplier_deleted'
  | 'buyer_invited' | 'buyer_access_updated'
  | 'buyer_order_status_changed'
  | 'quote_status_changed'
  | 'logo_uploaded' | 'logo_deleted'

export async function logAudit({
  action,
  entityType,
  entityId,
  entityName,
  userId,
  metadata,
}: {
  action: AuditAction
  entityType: string
  entityId?: string
  entityName?: string
  userId?: string
  metadata?: Record<string, unknown>
}) {
  const db = createAdminClient()
  await db.from('audit_log').insert({
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    entity_name: entityName ?? null,
    user_id: userId ?? null,
    metadata: metadata ?? null,
  })
}
