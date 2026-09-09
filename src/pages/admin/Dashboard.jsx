import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { money, formatTime, statusColor, isSameDay, inRange } from '../../lib/format'
import { CheckIcon, EyeIcon, ReceiptIcon, OrdersIcon, BoxIcon, ChartIcon } from '../../components/icons'

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={23} />
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500 leading-tight">
          {label}
        </div>
        <div className="font-display font-extrabold text-lg text-slate-900 leading-tight truncate">
          {value}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    Promise.all([api.getOrders(), api.getProducts(false)])
      .then(([o, p]) => {
        setOrders(o)
        setProducts(p)
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const todays = orders.filter((o) => inRange(o.created_at, 'today'))
  const pending = orders.filter((o) => o.status === 'Pending').length
  const completed = orders.filter((o) => o.status === 'Delivered').length
  const todaysSales = todays
    .filter((o) => o.status !== 'Cancelled')
    .reduce((s, o) => s + Number(o.total), 0)

  const complete = async (e, id) => {
    e.stopPropagation()
    setBusyId(id)
    await api.setOrderStatus(id, 'Delivered')
    load()
    setBusyId(null)
  }

  return (
    <div className="p-3.5">
      <h1 className="font-display text-xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-3">Overview of today's activity</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <StatCard label="Today's Orders" value={todays.length} color="bg-blue-50 text-blue-700" icon={OrdersIcon} />
        <StatCard label="Pending Orders" value={pending} color="bg-amber-50 text-amber-700" icon={ChartIcon} />
        <StatCard label="Completed Orders" value={completed} color="bg-emerald-50 text-emerald-700" icon={CheckIcon} />
        <StatCard label="Today's Sales" value={money(todaysSales)} color="bg-teal-50 text-teal-700" icon={ChartIcon} />
        <StatCard label="Total Products" value={products.length} color="bg-violet-50 text-violet-700" icon={BoxIcon} />
      </div>

      <div className="flex items-center justify-between mt-5 mb-2">
        <h2 className="font-display font-bold text-lg text-slate-900">Today's Orders</h2>
        <Link to="/admin/orders" className="text-teal-700 text-sm font-bold">View all</Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading…</div>
      ) : todays.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <OrdersIcon size={40} className="mx-auto text-slate-300" />
          <p className="mt-2 font-semibold">No orders today yet</p>
          <p className="text-xs">New customer orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {todays.map((o) => (
            <div key={o.id} className="card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-teal-800">{o.order_number}</div>
                  <div className="font-semibold text-sm text-slate-800 truncate">{o.customer_name}</div>
                  <div className="text-xs text-slate-500">
                    {o.phone} · {formatTime(o.created_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-slate-900">{money(o.total)}</div>
                  <span className={`inline-block mt-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="btn btn-ghost !py-2 text-[12.5px]">
                  <EyeIcon size={15} /> View
                </button>
                {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                  <button onClick={(e) => complete(e, o.id)} disabled={busyId === o.id} className="btn btn-teal !py-2 text-[12.5px]">
                    <CheckIcon size={15} /> {busyId === o.id ? '…' : 'Complete'}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/admin/orders/${o.id}?print=1`)}
                  className={`btn btn-light !py-2 text-[12.5px] ${o.status === 'Delivered' || o.status === 'Cancelled' ? 'col-span-2' : ''}`}
                >
                  <ReceiptIcon size={15} /> Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/admin/products/new" className="btn btn-teal w-full mt-5">
        + Add New Product
      </Link>
    </div>
  )
}
