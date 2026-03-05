'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useEscapeClose } from '@/lib/useKeyboardSave'

interface Quote {
  id: string
  customer_name: string
  customer_email: string
  customer_company: string | null
  product_name: string | null
  quantity: number
  styles: { name: string } | null
}

export default function EmailQuoteModal({
  quote,
  quotedPrice,
  onClose,
  onSent,
}: {
  quote: Quote
  quotedPrice: string
  onClose: () => void
  onSent: () => void
}) {
  const productLabel = quote.styles?.name || quote.product_name || 'Custom Product'
  const companyLabel = quote.customer_company || quote.customer_name

  const [subject, setSubject] = useState(
    `Quote for ${productLabel} - ${companyLabel}`
  )
  const [body, setBody] = useState(
    `Dear ${quote.customer_name},\n\n` +
    `Thank you for your interest in ${productLabel}.\n\n` +
    `Please find below our quote for your request:\n\n` +
    `Product: ${productLabel}\n` +
    `Quantity: ${quote.quantity} units\n` +
    `Total Price: €${Number(quotedPrice).toFixed(2)}\n\n` +
    `Lead time: Approximately 3-4 weeks from order confirmation.\n\n` +
    `To proceed with this order, please reply to this email with your confirmation.\n\n` +
    `If you have any questions or need adjustments, don't hesitate to reach out.\n\n` +
    `Best regards,\n` +
    `Atelier Team`
  )

  useEscapeClose(onClose)

  const handleSendViaMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(quote.customer_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
    toast.success('Email client opened')
    onSent()
  }

  const handleCopyToClipboard = async () => {
    const fullEmail = `To: ${quote.customer_email}\nSubject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(fullEmail)
      toast.success('Email copied to clipboard')
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = fullEmail
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success('Email copied to clipboard')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-6">Send Quote Email</h3>

        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">To</label>
            <div className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-neutral-300">
              {quote.customer_name} &lt;{quote.customer_email}&gt;
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-neutral-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-neutral-800">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition">
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={handleSendViaMailto}
              className="px-6 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              Open in Email Client
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
