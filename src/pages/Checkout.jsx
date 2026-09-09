import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useApp } from '../context/AppContext'
import api from '../lib/api'
import { money, buildWhatsAppMessage, whatsappLink } from '../lib/format'
import { ChevronLeft, WhatsAppIcon } from '../components/icons'

const empty = {
  customer_name: '',
  shop_name: '',
  phone: '',
  whatsapp: '',
  city: '',
  address: '',
  notes: '',
}

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { settings } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const placeOrder = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.customer_name.trim()) return setError('Please enter your name.')
    if (!form.phone.trim()) return setError('Please enter your mobile number.')
    if (!form.city.trim()) return setError('Please enter your city.')
    if (!form.address.trim()) return setError('Please enter your address.')
    if (items.length === 0) return setError('Your cart is empty.')

    setSubmitting(true)
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        shop_name: form.shop_name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        subtotal: total,
        discount: 0,
        total,
      }
      const orderItems = items.map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        size: it.size,
        quantity: it.qty,
        purchase_price: 0, // filled privately on the server (demo uses product cost)
        selling_price: it.selling_price,
        total: it.selling_price * it.qty,
      }))

      const { order, items: savedItems } = await api.createOrder(payload, orderItems)
      const message = buildWhatsAppMessage(order, savedItems)
      const link = whatsappLink(settings.whatsapp, message)

      localStorage.setItem(
        'gumeli_last_order',
        JSON.stringify({ order, items: savedItems, waLink: link, at: Date.now() })
      )
      clear()
      window.open(link, '_blank')
      navigate('/order-success')
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.')
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="font-display font-bold text-xl text-slate-800">Your cart is empty</h2>
        <Link to="/" className="btn btn-teal mt-4">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 pb-28">
      <Link to="/cart" className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm mb-3">
        <ChevronLeft size={17} /> Back to cart
      </Link>

      <h1 className="font-display text-xl font-bold text-slate-900">Checkout</h1>
      <p className="text-sm text-slate-500 mb-4">
        No account needed. Fill in your details and order will be sent on WhatsApp.
      </p>

      <form onSubmit={placeOrder} className="space-y-4">
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-slate-800">Contact &amp; Delivery Details</h2>

          <div>
            <label className="field-label">Customer Name *</label>
            <input className="field" value={form.customer_name} onChange={set('customer_name')} placeholder="Your full name" />
          </div>
          <div>
            <label className="field-label">Shop / Business Name (optional)</label>
            <input className="field" value={form.shop_name} onChange={set('shop_name')} placeholder="e.g. City Medical Store" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Mobile Number *</label>
              <input className="field" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="03xx xxxxxxx" />
            </div>
            <div>
              <label className="field-label">WhatsApp Number</label>
              <input className="field" inputMode="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="Same as mobile" />
            </div>
          </div>
          <div>
            <label className="field-label">City *</label>
            <input className="field" value={form.city} onChange={set('city')} placeholder="Your city" />
          </div>
          <div>
            <label className="field-label">Address *</label>
            <textarea className="field" rows={2} value={form.address} onChange={set('address')} placeholder="Shop number, street, area…" />
          </div>
          <div>
            <label className="field-label">Order Notes (optional)</label>
            <textarea className="field" rows={2} value={form.notes} onChange={set('notes')} placeholder="Any special instructions" />
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-4">
          <h2 className="font-bold text-slate-800 mb-2">Order Summary</h2>
          <div className="divide-y divide-slate-100">
            {items.map((it) => (
              <div key={it.key} className="py-2 flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-[13px] leading-snug">{it.product_name}</div>
                  <div className="text-slate-500 text-xs">
                    Size: {it.size} · Qty: {it.qty} · {money(it.selling_price)}
                  </div>
                </div>
                <div className="font-bold text-slate-900 shrink-0">{money(it.selling_price * it.qty)}</div>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-slate-200 mt-2 pt-3 flex items-center justify-between">
            <span className="font-bold text-slate-700">GRAND TOTAL</span>
            <span className="font-display font-extrabold text-xl text-teal-800">{money(total)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn btn-whatsapp w-full text-base py-4">
          <WhatsAppIcon size={22} />
          {submitting ? 'Placing order…' : 'PLACE ORDER VIA WHATSAPP'}
        </button>
      </form>
    </div>
  )
}
