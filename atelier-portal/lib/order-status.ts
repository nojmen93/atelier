export const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-900/40 text-blue-400',
  in_production: 'bg-orange-900/40 text-orange-400',
  shipped: 'bg-green-900/40 text-green-400',
  delivered: 'bg-emerald-900/40 text-emerald-400',
  cancelled: 'bg-red-900/40 text-red-400',
}

export const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  in_production: 'In Production',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
