// ----------------------- Prices -----------------------
export const money = (n) => {
  const num = Number(n || 0)
  return 'Rs. ' + num.toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

export const priceAfterDiscount = (product) => {
  const price = Number(product?.selling_price || 0)
  const discount = Number(product?.discount || 0)
  if (discount > 0) return Math.round(price * (1 - discount / 100))
  return price
}

export const discountAmount = (product) =>
  Number(product?.selling_price || 0) - priceAfterDiscount(product)

// ----------------------- Stock -----------------------
export const stockStatus = (product) => {
  const stock = Number(product?.stock ?? 0)
  if (stock <= 0) return 'out'
  if (stock <= Number(product?.low_stock_alert || 5)) return 'low'
  return 'in'
}

// ----------------------- Dates -----------------------
export const startOfDay = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export const isSameDay = (a, b) => {
  const x = new Date(a)
  const y = new Date(b)
  return x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const formatDateTime = (d) => `${formatDate(d)} · ${formatTime(d)}`

export const inRange = (dateStr, range) => {
  const d = new Date(dateStr)
  const now = new Date()
  const today = startOfDay(now)
  if (range === 'today') return d >= today
  if (range === 'yesterday') {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    return d >= y && d < today
  }
  if (range === 'week') {
    const start = new Date(today)
    const day = (start.getDay() + 6) % 7 // Monday start
    start.setDate(start.getDate() - day)
    return d >= start
  }
  if (range === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  return true
}

export const dayKey = (d) => {
  const x = new Date(d)
  return x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// ----------------------- Order statuses -----------------------
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Ready',
  'Delivered',
  'Cancelled',
]

export const statusColor = (status) => {
  const map = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    Processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Ready: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
  }
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

// ----------------------- WhatsApp -----------------------
export const onlyDigits = (str = '') => String(str).replace(/[^\d]/g, '')

export const buildWhatsAppMessage = (order, items) => {
  const line = (label, value) => `${label}: ${value || '-'}`
  const rows = items
    .map((it, i) => {
      return [
        `${i + 1}. ${it.product_name}`,
        `Size: ${it.size || 'Standard'}`,
        `Quantity: ${it.quantity}`,
        `Price: ${money(it.selling_price)}`,
        `Total: ${money(it.total)}`,
      ].join('\n')
    })
    .join('\n\n')

  return [
    'GUMELI SURGICAL',
    'NEW ORDER',
    '',
    `Order No: ${order.order_number}`,
    '',
    line('Customer', order.customer_name),
    line('Shop', order.shop_name),
    line('Phone', order.phone),
    line('WhatsApp', order.whatsapp),
    line('City', order.city),
    line('Address', order.address),
    '',
    'PRODUCTS:',
    '',
    rows,
    '',
    `GRAND TOTAL: ${money(order.total)}`,
    '',
    line('Notes', order.notes),
  ].join('\n')
}

export const whatsappLink = (whatsappNumber, message) => {
  const digits = onlyDigits(whatsappNumber)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
