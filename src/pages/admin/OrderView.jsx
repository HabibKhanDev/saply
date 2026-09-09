import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import { useApp } from '../../context/AppContext'
import {
  money, formatDate, statusColor, ORDER_STATUSES, buildWhatsAppMessage, whatsappLink,
} from '../../lib/format'
import Logo from '../../components/Logo'
import { ArrowLeftIcon, PrinterIcon, WhatsAppIcon, PhoneIcon, PinIcon, AlertIcon, CheckIcon } from '../../components/icons'

export default function OrderView() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { settings } = useApp()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = () => api.getOrder(id).then(setOrder).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  // Auto open print dialog when arriving with ?print=1
  useEffect(() => {
    if (!loading && order && params.get('print') === '1') {
      const t = setTimeout(() => window.print(), 450)
      return () => clearTimeout(t)
    }
  }, [loading, order, params])

  const totals = useMemo(() => {
    if (!order) return { cost: 0, profit: 0 }
    const cost = (order.items || []).reduce((s, i) => s + Number(i.purchase_price || 0) * i.quantity, 0)
    return { cost, profit: Number(order.total) - cost }
  }, [order])

  const changeStatus = async (status) => {
    setBusy(true)
    await api.setOrderStatus(id, status)
    await load()
    setBusy(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading order…</div>
  if (!order) {
    return (
      <div className="p-6 text-center">
        <AlertIcon size={44} className="mx-auto text-slate-300" />
        <p className="font-bold mt-2">Order not found</p>
        <Link to="/admin/orders" className="btn btn-teal mt-3">Back to orders</Link>
      </div>
    )
  }

  const invoiceNo = 'INV-' + (order.order_number || '').replace(/\D/g, '')
  const waLink = whatsappLink(settings.whatsapp, buildWhatsAppMessage(order, order.items))

  return (
    <div className="p-3.5 pb-10">
      {/* Screen controls (hidden while printing) */}
      <div className="no-print flex items-center gap-2 mb-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm">
          <ArrowLeftIcon size={17} /> Back
        </button>
        <button onClick={() => window.print()} className="btn btn-teal ml-auto !py-2 text-sm">
          <PrinterIcon size={17} /> Print Bill
        </button>
      </div>

      {/* Status manager */}
      <div className="card p-4 mb-3 no-print">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Order Status</h2>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {ORDER_STATUSES.map((s) => (
            <button key={s} disabled={busy || s === order.status}
              onClick={() => changeStatus(s)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[12.5px] font-bold border ${
                s === order.status
                  ? 'bg-teal-700 text-white border-teal-700'
                  : s === 'Cancelled'
                  ? 'bg-white text-red-600 border-red-200'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
              {s === order.status && <CheckIcon size={13} className="inline mr-0.5" />}{s}
            </button>
          ))}
        </div>
        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <button onClick={() => changeStatus('Delivered')} disabled={busy}
            className="btn btn-teal w-full mt-3 text-sm">
            ✓ Mark Complete / Delivered (reduces stock)
          </button>
        )}
      </div>

      {/* Customer info */}
      <div className="card p-4 mb-3 no-print">
        <h2 className="font-bold text-slate-800 mb-2">Customer Details</h2>
        <dl className="text-sm space-y-1.5">
          <Row label="Customer" value={order.customer_name} />
          {order.shop_name && <Row label="Shop" value={order.shop_name} />}
          <Row label="Phone" value={<a href={`tel:${order.phone}`} className="text-teal-700 font-semibold">{order.phone}</a>} />
          {order.whatsapp && <Row label="WhatsApp" value={order.whatsapp} />}
          <Row label="City" value={order.city} />
          <Row label="Address" value={order.address} />
          {order.notes && <Row label="Notes" value={order.notes} />}
        </dl>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp w-full mt-3 text-sm">
          <WhatsAppIcon size={18} /> Open Order in WhatsApp
        </a>
      </div>

      {/* Private cost / profit */}
      <div className="card p-4 mb-3 no-print border-amber-200">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Cost &amp; Profit</h2>
          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Private
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <div className="text-[10px] font-bold uppercase text-slate-500">Sale</div>
            <div className="font-extrabold text-slate-800 text-sm">{money(order.total)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <div className="text-[10px] font-bold uppercase text-slate-500">Cost</div>
            <div className="font-extrabold text-red-600 text-sm">{money(totals.cost)}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5">
            <div className="text-[10px] font-bold uppercase text-slate-500">Profit</div>
            <div className="font-extrabold text-emerald-700 text-sm">{money(totals.profit)}</div>
          </div>
        </div>
      </div>

      {/* ============ PRINTABLE INVOICE ============ */}
      <div className="print-area bg-white rounded-2xl border border-slate-200 p-5 text-slate-900">
        {/* Header */}
        <div className="flex items-start gap-3 border-b-2 border-teal-700 pb-4">
          <Logo src={settings.logo_url} size={56} rounded="xl" />
          <div className="flex-1">
            <div className="font-display font-extrabold text-xl text-teal-800 leading-tight">
              {settings.store_name}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">Medical &amp; Surgical Wholesale</div>
            <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap gap-x-3">
              {settings.phone && <span className="inline-flex items-center gap-1"><PhoneIcon size={11} /> {settings.phone}</span>}
              {settings.whatsapp && <span>WhatsApp: {settings.whatsapp}</span>}
            </div>
            {(settings.address || settings.city) && (
              <div className="text-[11px] text-slate-600 flex items-start gap-1 mt-0.5">
                <PinIcon size={11} className="mt-0.5 shrink-0" />
                {[settings.address, settings.city].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Invoice meta */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-[12px]">
          <div>
            <div className="font-bold uppercase text-[10px] text-slate-400">Invoice</div>
            <div className="font-extrabold">{invoiceNo}</div>
            <div className="text-slate-600">Order: {order.order_number}</div>
            <div className="text-slate-600">Date: {formatDate(order.created_at)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold uppercase text-[10px] text-slate-400">Bill To</div>
            <div className="font-extrabold">{order.customer_name}</div>
            {order.shop_name && <div className="text-slate-600">{order.shop_name}</div>}
            <div className="text-slate-600">{order.phone}</div>
          </div>
        </div>
        {order.address && (
          <div className="text-[11.5px] text-slate-600 mt-1">{order.address}{order.city ? `, ${order.city}` : ''}</div>
        )}

        {/* Items */}
        <table className="w-full mt-4 text-[12px] border-collapse">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="text-left p-2 font-bold">Product</th>
              <th className="text-center p-2 font-bold">Size</th>
              <th className="text-center p-2 font-bold">Qty</th>
              <th className="text-right p-2 font-bold">Price</th>
              <th className="text-right p-2 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((it, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="p-2 font-semibold">{it.product_name}</td>
                <td className="p-2 text-center">{it.size || 'Standard'}</td>
                <td className="p-2 text-center">{it.quantity}</td>
                <td className="p-2 text-right whitespace-nowrap">{money(it.selling_price)}</td>
                <td className="p-2 text-right whitespace-nowrap font-bold">{money(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-3">
          <div className="w-full max-w-[240px] text-[12.5px] space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{money(order.subtotal || order.total)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span className="font-semibold">{money(order.discount || 0)}</span></div>
            <div className="flex justify-between border-t-2 border-teal-700 pt-1.5 mt-1.5">
              <span className="font-extrabold">Grand Total</span>
              <span className="font-display font-extrabold text-teal-800 text-base">{money(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Status + footer */}
        <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-200 pt-3">
          <span className="font-semibold">Status: <span className="font-bold">{order.status}</span></span>
          <span className="text-slate-500">Thank you for shopping with {settings.store_name}</span>
        </div>
        {settings.footer_text && (
          <div className="text-center text-[10px] text-slate-400 mt-2">{settings.footer_text}</div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-800">{value || '—'}</dd>
    </div>
  )
}
