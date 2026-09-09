import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../context/CartContext'
import { money, priceAfterDiscount, stockStatus } from '../lib/format'
import ProductImage from '../components/ProductImage'
import { ArrowLeftIcon, CartIcon, CheckIcon, AlertIcon } from '../components/icons'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getProduct(id).then((p) => {
      setProduct(p)
      setSize(p?.sizes?.[0] || 'Standard')
      setActiveImg(0)
    }).finally(() => setLoading(false))
  }, [id])

  const status = product ? stockStatus(product) : 'in'
  const offerPrice = product ? priceAfterDiscount(product) : 0
  const hasDiscount = product && Number(product.discount) > 0
  const gallery = useMemo(() => product?.images || [], [product])

  const handleAdd = () => {
    addItem(product, size, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }
  const handleOrderNow = () => {
    addItem(product, size, qty)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card animate-pulse">
          <div className="aspect-square sm:aspect-[4/3] bg-slate-200 rounded-t-2xl" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <AlertIcon size={48} className="mx-auto text-slate-300" />
        <h2 className="font-bold text-lg mt-3">Product not found</h2>
        <p className="text-slate-500 text-sm mt-1">It may have been removed or is currently hidden.</p>
        <Link to="/" className="btn btn-teal mt-5">Back to products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 py-4">
      <Link to="/" className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm mb-3">
        <ArrowLeftIcon size={17} /> Continue shopping
      </Link>

      <div className="card overflow-hidden">
        <div className="grid sm:grid-cols-2">
          {/* Gallery */}
          <div className="p-3 bg-white">
            <div className="rounded-xl overflow-hidden border border-slate-100">
              {gallery.length ? (
                <img src={gallery[activeImg]} alt={product.name} className="w-full aspect-square object-cover" />
              ) : (
                <ProductImage product={product} className="w-full aspect-square" emojiClass="text-8xl" />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                      i === activeImg ? 'border-teal-600' : 'border-transparent'
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-teal-700">
              {product.category}
            </div>
            <h1 className="font-display font-bold text-xl text-slate-900 leading-tight mt-1">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-slate-900">{money(offerPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-slate-400 line-through">{money(product.selling_price)}</span>
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {Math.round(product.discount)}% OFF
                  </span>
                </>
              )}
            </div>

            {status === 'in' && (
              <div className="mt-2 text-sm font-semibold text-emerald-700">✓ In Stock</div>
            )}
            {status === 'low' && (
              <div className="mt-2 text-sm font-semibold text-amber-700">
                ⚠ Only {product.stock} left in stock
              </div>
            )}
            {status === 'out' && (
              <div className="mt-2 text-sm font-bold text-red-600">✕ Out of Stock</div>
            )}

            {product.offer && (
              <div className="mt-3 text-[13px] font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                🎁 {product.offer}
              </div>
            )}
            {product.bonus && (
              <div className="mt-2 text-[13px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                ✨ {product.bonus}
              </div>
            )}

            {/* Sizes */}
            <div className="mt-4">
              <div className="field-label">Available Size{product.sizes?.length > 1 ? 's' : ''}</div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes?.length ? product.sizes : ['Standard']).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                      size === s
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <div className="field-label">Quantity</div>
              <div className="inline-flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  className="w-11 h-11 flex items-center justify-center text-teal-700 text-xl font-bold disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 h-11 text-center font-bold text-lg outline-none border-x-2 border-slate-200"
                />
                <button
                  className="w-11 h-11 flex items-center justify-center text-teal-700 text-xl font-bold disabled:opacity-40"
                  onClick={() => setQty((q) => q + 1)}
                  disabled={status === 'out' || qty >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                disabled={status === 'out'}
                className="btn btn-light"
              >
                {added ? <><CheckIcon size={18} /> Added</> : <><CartIcon size={18} /> Add to Cart</>}
              </button>
              <button
                onClick={handleOrderNow}
                disabled={status === 'out'}
                className="btn btn-whatsapp"
              >
                Order Now
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-slate-500">
              {product.brand && <div><b className="text-slate-700">Brand:</b> {product.brand}</div>}
              {product.sku && <div><b className="text-slate-700">Code/SKU:</b> {product.sku}</div>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-t border-slate-100">
          <h2 className="font-display font-bold text-slate-800 mb-1.5">Product Description</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}
