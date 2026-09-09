import { Link } from 'react-router-dom'
import { money } from '../lib/format'
import { WhatsAppIcon, CheckIcon } from '../components/icons'

export default function OrderSuccess() {
  const raw = (() => {
    try {
      return JSON.parse(localStorage.getItem('gumeli_last_order') || 'null')
    } catch {
      return null
    }
  })()

  if (!raw?.order) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="font-display font-bold text-xl text-slate-800">No recent order found</h2>
        <Link to="/" className="btn btn-teal mt-4">Browse Products</Link>
      </div>
    )
  }

  const { order, items, waLink } = raw

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckIcon size={44} stroke={3} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-4">Order Placed!</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your order has been saved. If WhatsApp did not open automatically, tap the button below.
        </p>
      </div>

      <div className="card p-4 mt-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-sm">Order Number</span>
          <span className="font-display font-extrabold text-teal-800 text-lg">{order.order_number}</span>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {items.map((it, i) => (
            <div key={i} className="py-2 flex justify-between text-sm gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 text-[13px]">{it.product_name}</div>
                <div className="text-slate-500 text-xs">
                  {it.size} × {it.quantity}
                </div>
              </div>
              <span className="font-bold shrink-0">{money(it.total)}</span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-slate-200 mt-2 pt-3 flex justify-between">
          <span className="font-bold">GRAND TOTAL</span>
          <span className="font-display font-extrabold text-lg text-teal-800">{money(order.total)}</span>
        </div>
      </div>

      <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp w-full mt-4 py-4 text-base">
        <WhatsAppIcon size={22} /> Send Order on WhatsApp
      </a>
      <Link to="/" className="btn btn-light w-full mt-3">
        Continue Shopping
      </Link>
    </div>
  )
}
