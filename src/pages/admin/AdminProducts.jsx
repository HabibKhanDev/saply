import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { money, stockStatus } from '../../lib/format'
import ProductImage from '../../components/ProductImage'
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../components/icons'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = () => api.getProducts(false).then(setProducts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return products.filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    )
  }, [products, q])

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    await api.deleteProduct(p.id)
    load()
  }

  return (
    <div className="p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">{products.length} products in store</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-teal !px-3.5">
          <PlusIcon size={19} /> Add
        </Link>
      </div>

      <div className="relative mt-3">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="field pl-10" placeholder="Search products, code, category…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400 text-sm">Loading products…</div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {filtered.map((p) => {
            const status = stockStatus(p)
            const profit = Number(p.selling_price) - Number(p.purchase_price)
            return (
              <div key={p.id} className="card p-3 flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                  <ProductImage product={p} className="w-full h-full" emojiClass="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13.5px] leading-snug text-slate-800 line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {p.category} {p.sku ? `· ${p.sku}` : ''}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11.5px]">
                    <span className="font-bold text-teal-800">Sell {money(p.selling_price)}</span>
                    <span className="text-emerald-700 font-semibold">Profit {money(profit)}/pc</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded-full ${
                        status === 'out'
                          ? 'bg-red-100 text-red-700'
                          : status === 'low'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {status === 'out' ? 'OUT' : status === 'low' ? `LOW · ${p.stock}` : `STOCK · ${p.stock}`}
                    </span>
                    {p.status === 'hidden' && (
                      <span className="font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">HIDDEN</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link to={`/admin/products/${p.id}/edit`} className="btn btn-light !p-2.5" aria-label="Edit">
                    <EditIcon size={17} />
                  </Link>
                  <button onClick={() => remove(p)} className="btn btn-danger !p-2.5" aria-label="Delete">
                    <TrashIcon size={17} />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-slate-500 text-sm">No products found.</div>
          )}
        </div>
      )}

      <Link to="/admin/products/new" className="btn btn-teal w-full mt-4">
        <PlusIcon size={20} /> Add New Product
      </Link>
    </div>
  )
}
