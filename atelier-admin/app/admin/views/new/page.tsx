'use client'

import BackLink from '@/components/BackLink'
import ViewBuilder from '@/components/ViewBuilder'

export default function NewViewPage() {
  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/views" label="Back to Views" />
      <ViewBuilder />
    </div>
  )
}
