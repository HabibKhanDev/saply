import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { money, formatDateTime, statusColor, inRange, ORDER_STATUSES } from '../../lib/format'
import { ChevronRight } from '../../components/icons'

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('today')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    api.getOrders().then(setOrders).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => inRange(o.created_at, range))
        .filter((o) => status === 'All' || o.status === status),
    [orders, range, status]
  )

  return (
    <div className="p-3.5">
      <h1 className="font-display text-xl font-bold text-slate-900">Order History</h1>
      <p className="text-sm text-slate-500 mb-3">{filtered.length} orders</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold border ${
              range === r.key ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <select className="field !py-2.5" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400 text-sm">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 mt-3">
          <p className="font-semibold">No orders found</p>
          <p className="text-xs">Try another filter.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {filtered.map((o) => (
            <button key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}
              className="card p-3.5 w-full text-left active:bg-slate-50 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-extrabold text-teal-800">{o.order_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-800 truncate mt-0.5">{o.customer_name}</div>
                <div className="text-[11.5px] text-slate-500 truncate">
                  {o.phone} · {o.city} · {formatDateTime(o.created_at)}
                </div>
                <div className="text-[11.5px] text-slate-500">
                  {(o.items || []).reduce((s, i) => s + i.quantity, 0)} items
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-slate-900">{money(o.total)}</div>
                <ChevronRight size={18} className="text-slate-300 ml-auto mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
