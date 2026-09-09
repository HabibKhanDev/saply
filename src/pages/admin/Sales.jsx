import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { money, formatDate, inRange, dayKey } from '../../lib/format'
import { ChartIcon } from '../../components/icons'

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

const orderCost = (o) =>
  (o.items || []).reduce((s, i) => s + Number(i.purchase_price || 0) * Number(i.quantity || 1), 0)

export default function Sales() {
  const [orders, setOrders] = useState([])
  const [range, setRange] = useState('month')

  useEffect(() => { api.getOrders().then(setOrders) }, [])

  const delivered = useMemo(
    () => orders.filter((o) => o.status === 'Delivered' && inRange(o.created_at, range)),
    [orders, range]
  )

  const totals = useMemo(() => {
    let sale = 0, cost = 0
    delivered.forEach((o) => {
      sale += Number(o.total || 0)
      cost += orderCost(o)
    })
    return { sale, cost, profit: sale - cost }
  }, [delivered])

  const daily = useMemo(() => {
    const map = {}
    delivered.forEach((o) => {
      const k = dayKey(o.created_at)
      if (!map[k]) map[k] = { sale: 0, cost: 0, count: 0 }
      map[k].sale += Number(o.total || 0)
      map[k].cost += orderCost(o)
      map[k].count += 1
    })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [delivered])

  return (
    <div className="p-3.5 pb-10">
      <h1 className="font-display text-xl font-bold text-slate-900">Sales History &amp; Profit</h1>
      <p className="text-sm text-slate-500 mb-3">Completed (delivered) orders only.</p>

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

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="card p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-500">Total Sale</div>
          <div className="font-display font-extrabold text-teal-800 text-[15px] mt-1">{money(totals.sale)}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-500">Total Cost</div>
          <div className="font-display font-extrabold text-red-600 text-[15px] mt-1">{money(totals.cost)}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-500">Profit</div>
          <div className="font-display font-extrabold text-emerald-700 text-[15px] mt-1">{money(totals.profit)}</div>
        </div>
      </div>

      {/* Daily summary */}
      <h2 className="font-bold text-slate-800 mt-5 mb-2">Daily Totals</h2>
      <div className="card divide-y divide-slate-100">
        {daily.length === 0 && <div className="p-5 text-center text-slate-400 text-sm">No completed sales yet.</div>}
        {daily.map(([day, v]) => (
          <div key={day} className="p-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-bold text-slate-800">{day}</div>
              <div className="text-[11.5px] text-slate-500">{v.count} order(s)</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-teal-800">{money(v.sale)}</div>
              <div className="text-[11.5px] font-semibold text-emerald-700">Profit {money(v.sale - v.cost)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Order level details */}
      <h2 className="font-bold text-slate-800 mt-5 mb-2">Order Details</h2>
      <div className="space-y-2.5">
        {delivered.length === 0 && (
          <div className="card p-8 text-center text-slate-500">
            <ChartIcon size={40} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm font-semibold">Nothing here yet</p>
            <p className="text-xs">Mark orders “Delivered” and they will appear here.</p>
          </div>
        )}
        {delivered.map((o) => {
          const cost = orderCost(o)
          return (
            <div key={o.id} className="card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-teal-800">{o.order_number}</div>
                  <div className="text-sm font-semibold text-slate-800 truncate">{o.customer_name}</div>
                  <div className="text-[11.5px] text-slate-500">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-right text-[12.5px] shrink-0">
                  <div className="font-bold text-slate-900">Sale {money(o.total)}</div>
                  <div className="text-red-600 font-semibold">Cost {money(cost)}</div>
                  <div className="text-emerald-700 font-extrabold">Profit {money(Number(o.total) - cost)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
