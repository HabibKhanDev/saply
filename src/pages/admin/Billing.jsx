import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { money, formatDate, statusColor, inRange } from '../../lib/format'
import { PrinterIcon } from '../../components/icons'

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

export default function Billing() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [range, setRange] = useState('month')
  const [onlyDone, setOnlyDone] = useState(false)

  useEffect(() => { api.getOrders().then(setOrders) }, [])

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => inRange(o.created_at, range))
        .filter((o) => !onlyDone || o.status === 'Delivered')
        .filter((o) => o.status !== 'Cancelled'),
    [orders, range, onlyDone]
  )

  return (
    <div className="p-3.5">
      <h1 className="font-display text-xl font-bold text-slate-900">Billing</h1>
      <p className="text-sm text-slate-500 mb-3">Tap “Print Bill” to create a printable invoice.</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold border ${
              range === r.key ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200'
            }`}>
            {r.label}
          </button>
        ))}
        <button onClick={() => setOnlyDone((v) => !v)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold border ${
            onlyDone ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
          }`}>
          Delivered only
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-500 text-sm">No bills in this period.</div>
        )}
        {filtered.map((o) => (
          <div key={o.id} className="card p-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-teal-800">{o.order_number}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(o.status)}`}>
                  {o.status}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800 truncate">{o.customer_name}</div>
              <div className="text-[11.5px] text-slate-500">
                {formatDate(o.created_at)} · {money(o.total)}
              </div>
            </div>
            <button onClick={() => navigate(`/admin/orders/${o.id}?print=1`)}
              className="btn btn-teal !py-2.5 text-[13px] shrink-0">
              <PrinterIcon size={16} /> Print Bill
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
