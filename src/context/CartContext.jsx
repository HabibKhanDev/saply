import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { priceAfterDiscount } from '../lib/format'

const CartContext = createContext(null)
const KEY = 'gumeli_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, size, qty = 1) => {
    const chosenSize = size || product.sizes?.[0] || 'Standard'
    const unit = priceAfterDiscount(product)
    const key = `${product.id}__${chosenSize}`
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(i.qty + qty, product.stock || 9999) } : i
        )
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          product_name: product.name,
          image: product.images?.[0] || '',
          category: product.category,
          size: chosenSize,
          selling_price: unit,
          qty,
          stock: product.stock || 0,
        },
      ]
    })
  }

  const setQty = (key, qty) =>
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 9999)) } : i))
    )

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key))
  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const total = useMemo(
    () => items.reduce((s, i) => s + i.qty * Number(i.selling_price), 0),
    [items]
  )

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
