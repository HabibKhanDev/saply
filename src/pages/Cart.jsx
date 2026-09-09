import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'
import ProductImage from '../components/ProductImage'
import { TrashIcon, CartIcon, ChevronLeft } from '../components/icons'

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <CartIcon size={56} className="mx-auto text-slate-300" />
        <h2 className="font-display font-bold text-xl mt-4 text-slate-800">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mt-1">Add medical &amp; surgical products to place an order.</p>
        <Link to="/" className="btn btn-teal mt-5">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm mb-3">
        <ChevronLeft size={17} /> Continue shopping
      </button>

      <h1 className="font-display text-xl font-bold text-slate-900 mb-3">Your Cart</h1>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.key} className="card p-3 flex gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100">
              {it.image ? (
                <img src={it.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <ProductImage product={{ category: it.category, images: [] }} className="w-full h-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13.5px] leading-snug text-slate-800 line-clamp-2">
                {it.product_name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Size: {it.size}</div>
              <div className="text-sm font-bold text-teal-800 mt-0.5">{money(it.selling_price)} each</div>

              <div className="flex items-center justify-between mt-2">
                <div className="inline-flex items-center border-2 border-slate-200 rounded-lg">
                  <button
                    className="w-9 h-9 flex items-center justify-center font-bold text-teal-700"
                    onClick={() => setQty(it.key, it.qty - 1)}
                  >
                    −
                  </button>
                  <span className="w-9 text-center font-bold text-sm">{it.qty}</span>
                  <button
                    className="w-9 h-9 flex items-center justify-center font-bold text-teal-700 disabled:opacity-40"
                    onClick={() => setQty(it.key, it.qty + 1)}
                    disabled={it.stock > 0 && it.qty >= it.stock}
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">{money(it.selling_price * it.qty)}</span>
                  <button
                    onClick={() => removeItem(it.key)}
                    className="text-red-500 p-1.5"
                    aria-label="Remove"
                  >
                    <TrashIcon size={19} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 mt-4 sticky bottom-24 shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-600">Total Amount</span>
          <span className="font-display font-extrabold text-2xl text-teal-800">{money(total)}</span>
        </div>
        <Link to="/checkout" className="btn btn-teal w-full mt-3 text-base">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}
