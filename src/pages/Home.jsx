import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { SearchIcon, BoxIcon } from '../components/icons'

export default function Home() {
  const { settings } = useApp()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    api.getProducts(true).then(setProducts).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category))
    return ['All', ...[...set].sort()]
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat = category === 'All' || p.category === category
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [products, query, category])

  const featured = filtered.some((p) => p.featured)

  return (
    <div>
      {/* Hero / search */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-700 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-7 pb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
            {settings.store_name}
          </h1>
          <p className="text-teal-100 text-sm mt-1.5 max-w-xl">
            Medical &amp; surgical products at wholesale prices for medical stores, clinics and
            customers. Search and order in seconds.
          </p>

          <div className="relative mt-4">
            <SearchIcon
              size={20}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gloves, syringes, cannula…"
              className="w-full h-13 pl-11 pr-4 py-3.5 rounded-2xl text-slate-800 text-base shadow-lg outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 -mx-3 px-3 sticky top-16 bg-slate-100/95 backdrop-blur z-20">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition-colors ${
                category === c
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-t-2xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-6 bg-slate-200 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <BoxIcon size={52} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold">No products found</p>
            <p className="text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <>
            {featured && (
              <h2 className="font-display font-bold text-slate-800 text-lg mb-1 mt-1">
                {category === 'All' && !query ? 'Featured Products' : 'Products'}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-10 mt-2">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
