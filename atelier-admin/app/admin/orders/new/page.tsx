'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import BackLink from '@/components/BackLink'

export default function NewOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [styleId, setStyleId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [factoryId, setFactoryId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [orderDate, setOrderDate] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const [styles, setStyles] = useState<{ id: string; name: string }[]>([])
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [factories, setFactories] = useState<{ id: string; name: string }[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadOptions() {
      const [stylesRes, suppliersRes, factoriesRes] = await Promise.all([
        supabase.from('styles').select('id, name').order('name'),
        supabase.from('suppliers').select('id, name').order('name'),
        supabase.from('factories').select('id, name').order('name'),
      ])
      setStyles(stylesRes.data || [])
      setSuppliers(suppliersRes.data || [])
      setFactories(factoriesRes.data || [])
    }
    loadOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const qty = parseInt(quantity) || 1
    const uPrice = unitPrice ? parseFloat(unitPrice) : null

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber.trim(),
      style_id: styleId || null,
      supplier_id: supplierId || null,
      factory_id: factoryId || null,
      quantity: qty,
      unit_price: uPrice,
      total_price: uPrice ? uPrice * qty : null,
      currency,
      order_date: orderDate || null,
      expected_delivery: expectedDelivery || null,
      notes: notes || null,
      status: 'draft',
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Order created')
      router.push('/admin/orders')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/orders" label="Back to Orders" />
      <h1 className="text-3xl font-bold mb-8">New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Order Number</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. PO-2026-001"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white placeholder:text-neutral-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Style</label>
          <select
            value={styleId}
            onChange={(e) => setStyleId(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
          >
            <option value="">— Select style —</option>
            {styles.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            >
              <option value="">— Select supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Factory</label>
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            >
              <option value="">— Select factory —</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Unit Price</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="SEK">SEK</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expected Delivery</label>
            <input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}
