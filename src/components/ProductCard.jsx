import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { money, priceAfterDiscount, stockStatus } from '../lib/format'
import ProductImage from './ProductImage'
import { CartIcon } from './icons'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const offerPrice = priceAfterDiscount(product)
  const hasDiscount = Number(product.discount) > 0
  const status = stockStatus(product)
  const sizesText = product.sizes?.length ? product.sizes.join(', ') : 'Standard'

  const quickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (status === 'out') return
    addItem(product, product.sizes?.[0] || 'Standard', 1)
  }

  const orderNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (status === 'out') return
    addItem(product, product.sizes?.[0] || 'Standard', 1)
    navigate('/checkout')
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
    >
      <div className="relative">
        <ProductImage product={product} className="w-full aspect-square" />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            -{Math.round(product.discount)}%
          </span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute top-2 left-2 bg-teal-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            ★ Featured
          </span>
        )}
        {status === 'out' && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">OUT OF STOCK</span>
          </span>
        )}
        {status === 'low' && (
          <span className="absolute bottom-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            LOW STOCK
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-[13.5px] leading-snug text-slate-800 line-clamp-2 min-h-[2.6em]">
          {product.name}
        </h3>
        <p className="text-[11.5px] text-slate-500 mt-1 line-clamp-2 min-h-[2.4em]">
          {product.description}
        </p>

        <div className="text-[11px] text-slate-500 mt-1.5 truncate">
          <span className="font-semibold text-slate-600">Sizes:</span> {sizesText}
        </div>

        {product.offer && (
          <div className="mt-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-2 py-1 truncate">
            🎁 {product.offer}
          </div>
        )}
        {product.bonus && (
          <div className="mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 truncate">
            ✨ {product.bonus}
          </div>
        )}

        <div className="mt-2 flex items-end gap-1.5 flex-wrap">
          <span className="font-bold text-slate-900 text-[15px]">{money(offerPrice)}</span>
          {hasDiscount && (
            <span className="text-[12px] text-slate-400 line-through mb-0.5">
              {money(product.selling_price)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={quickAdd}
            disabled={status === 'out'}
            className="btn btn-light !px-2 !py-2 text-[12.5px]"
          >
            <CartIcon size={16} /> Add
          </button>
          <button
            type="button"
            onClick={orderNow}
            disabled={status === 'out'}
            className="btn btn-whatsapp !px-2 !py-2 text-[12.5px]"
          >
            Order Now
          </button>
        </div>
      </div>
    </Link>
  )
}
