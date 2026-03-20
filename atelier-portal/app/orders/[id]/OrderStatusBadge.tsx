'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-900/40 text-blue-400',
  in_production: 'bg-orange-900/40 text-orange-400',
  shipped: 'bg-green-900/40 text-green-400',
  delivered: 'bg-emerald-900/40 text-emerald-400',
  cancelled: 'bg-red-900/40 text-red-400',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function OrderStatusBadge({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'buyer_orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.status) {
            setStatus(payload.new.status)
            setLastUpdated(new Date())
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
          statusColors[status] ?? 'bg-neutral-800 text-neutral-400'
        }`}
      >
        {statusLabels[status] ?? status}
      </span>
      {lastUpdated && (
        <span className="text-[10px] text-neutral-600">
          Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}
