// =====================================================================
// DEMO DATA LAYER
// Used only when Supabase keys are not configured.
// Everything is stored in this device's browser (localStorage).
// Admin demo login: admin@gumeli.com / demo1234
// =====================================================================

const DB_KEY = 'gumeli_demo_db_v1'
const SESSION_KEY = 'gumeli_demo_admin'
const DEMO_EMAIL = 'admin@gumeli.com'
const DEMO_PASSWORD = 'demo1234'

const img = (file) => `${import.meta.env.BASE_URL}images/demo/${file}`

const now = Date.now()
const hoursAgo = (h) => new Date(now - h * 3600000).toISOString()

const seedProducts = [
  {
    id: 'p1', name: 'Latex Examination Gloves (Box of 100)',
    description: 'Powdered, ambidextrous latex examination gloves. Box of 100 pieces. Ideal for clinics, medical stores and daily examination use.',
    images: [img('examination-gloves.jpg')], category: 'Gloves', brand: '', sku: 'GLV-EX-100',
    sizes: ['Small', 'Medium', 'Large'], purchase_price: 650, selling_price: 799, discount: 0,
    offer: '', bonus: '', stock: 120, sold: 340, low_stock_alert: 20, status: 'active', featured: true,
    created_at: hoursAgo(200),
  },
  {
    id: 'p2', name: 'Sterile Surgical Gloves (Per Pair)',
    description: 'Individually packed sterile powdered surgical gloves for operating theatre and procedures.',
    images: [img('surgical-gloves.jpg')], category: 'Gloves', brand: '', sku: 'GLV-SG-PAIR',
    sizes: ['6', '6.5', '7', '7.5', '8', '8.5'], purchase_price: 28, selling_price: 40, discount: 0,
    offer: '', bonus: '', stock: 500, sold: 1200, low_stock_alert: 100, status: 'active', featured: false,
    created_at: hoursAgo(190),
  },
  {
    id: 'p3', name: '3-Ply Disposable Face Masks (Box of 50)',
    description: 'Blue 3-ply disposable masks with soft ear loops and adjustable nose strip. Box of 50 masks.',
    images: [img('face-masks.jpg')], category: 'Masks', brand: '', sku: 'MSK-3PLY-50',
    sizes: ['Standard'], purchase_price: 220, selling_price: 299, discount: 8,
    offer: 'Limited wholesale price', bonus: '', stock: 80, sold: 260, low_stock_alert: 15,
    status: 'active', featured: true, created_at: hoursAgo(180),
  },
  {
    id: 'p4', name: 'Disposable Syringe 3ml (Pack of 100)',
    description: 'Sterile single-use 3ml syringes with needle, sealed packs. Wholesale pack of 100.',
    images: [img('syringes.jpg')], category: 'Syringes', brand: '', sku: 'SYR-3ML',
    sizes: ['Standard'], purchase_price: 420, selling_price: 550, discount: 0,
    offer: '', bonus: '', stock: 60, sold: 180, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(170),
  },
  {
    id: 'p5', name: 'Disposable Syringe 5ml (Pack of 100)',
    description: 'Sterile single-use 5ml syringes with needle, sealed packs. Wholesale pack of 100.',
    images: [img('syringes.jpg')], category: 'Syringes', brand: '', sku: 'SYR-5ML',
    sizes: ['Standard'], purchase_price: 480, selling_price: 620, discount: 0,
    offer: '', bonus: '', stock: 55, sold: 150, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(165),
  },
  {
    id: 'p6', name: 'Disposable Syringe 10ml (Pack of 100)',
    description: 'Sterile single-use 10ml syringes with needle, sealed packs. Wholesale pack of 100.',
    images: [img('syringes.jpg')], category: 'Syringes', brand: '', sku: 'SYR-10ML',
    sizes: ['Standard'], purchase_price: 650, selling_price: 850, discount: 0,
    offer: '', bonus: '', stock: 40, sold: 90, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(160),
  },
  {
    id: 'p7', name: 'IV Cannula with Injection Port (Pack of 50)',
    description: 'Sterile IV cannula with wings and injection port, color coded by gauge. Pack of 50.',
    images: [img('iv-cannula.jpg')], category: 'IV & Infusion', brand: '', sku: 'IVC-PACK50',
    sizes: ['18G', '20G', '22G', '24G'], purchase_price: 350, selling_price: 450, discount: 0,
    offer: '', bonus: '', stock: 8, sold: 210, low_stock_alert: 10, status: 'active', featured: true,
    created_at: hoursAgo(150),
  },
  {
    id: 'p8', name: 'Scalp Vein Set / Butterfly (Pack of 100)',
    description: 'Sterile scalp vein (butterfly) needle with flexible wings and tubing. Pack of 100.',
    images: [img('iv-cannula.jpg')], category: 'IV & Infusion', brand: '', sku: 'SVS-PACK100',
    sizes: ['21G', '23G', '25G'], purchase_price: 380, selling_price: 499, discount: 0,
    offer: '', bonus: '', stock: 25, sold: 70, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(145),
  },
  {
    id: 'p9', name: 'IV Infusion Set (Pack of 10)',
    description: 'Disposable IV giving set with drip chamber, roller clamp and air vent. Pack of 10 sets.',
    images: [], category: 'IV & Infusion', brand: '', sku: 'IVS-PACK10',
    sizes: ['Standard'], purchase_price: 180, selling_price: 250, discount: 0,
    offer: '', bonus: '', stock: 35, sold: 120, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(140),
  },
  {
    id: 'p10', name: 'Urine Drainage Bag 2000ml (Pack of 10)',
    description: '2000ml urinary drainage bag with measurement scale, hanging hook, anti-reflux chamber and tubing.',
    images: [img('urine-bag.jpg')], category: 'Catheters & Bags', brand: '', sku: 'URB-2000',
    sizes: ['Standard'], purchase_price: 260, selling_price: 350, discount: 0,
    offer: '', bonus: '', stock: 30, sold: 60, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(130),
  },
  {
    id: 'p11', name: 'Foley Catheter 2-Way',
    description: 'Sterile silicone-coated 2-way Foley balloon catheter for urinary catheterization. Sold per piece.',
    images: [img('foley-catheter.jpg')], category: 'Catheters & Bags', brand: '', sku: 'FC-2WAY',
    sizes: ['14Fr', '16Fr', '18Fr', '20Fr'], purchase_price: 45, selling_price: 65, discount: 0,
    offer: '', bonus: '', stock: 140, sold: 300, low_stock_alert: 30, status: 'active', featured: false,
    created_at: hoursAgo(120),
  },
  {
    id: 'p12', name: 'Surgical Gauze Roll 36" x 100 Yards',
    description: 'Absorbent cotton surgical gauze bandage roll, 36 inch width x 100 yards. Used for dressings.',
    images: [img('bandage-gauze.jpg')], category: 'Dressings & Bandages', brand: '', sku: 'GZ-36-100',
    sizes: ['36 inch'], purchase_price: 950, selling_price: 1250, discount: 0,
    offer: '', bonus: '', stock: 22, sold: 45, low_stock_alert: 5, status: 'active', featured: false,
    created_at: hoursAgo(110),
  },
  {
    id: 'p13', name: 'Sterile Gauze Swabs 8 Ply 10x10cm (Pack of 100)',
    description: 'Pre-washed sterile gauze swabs, 8 ply, 10 x 10 cm. 100 swabs per pack for wound dressing.',
    images: [img('bandage-gauze.jpg')], category: 'Dressings & Bandages', brand: '', sku: 'GZS-1010',
    sizes: ['10 x 10 cm'], purchase_price: 280, selling_price: 380, discount: 0,
    offer: '', bonus: '', stock: 48, sold: 110, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(100),
  },
  {
    id: 'p14', name: 'Cotton Wool Roll 500g',
    description: 'Soft absorbent medical cotton wool roll, 500 grams. For cleaning, padding and dressings.',
    images: [], category: 'Dressings & Bandages', brand: '', sku: 'CTN-500',
    sizes: ['500g'], purchase_price: 220, selling_price: 290, discount: 0,
    offer: '', bonus: '', stock: 33, sold: 80, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(95),
  },
  {
    id: 'p15', name: 'Crepe Bandage',
    description: 'Elastic crepe bandage for compression and support. Available widths, length 4.5 yards per roll.',
    images: [img('bandage-gauze.jpg')], category: 'Dressings & Bandages', brand: '', sku: 'CRB-VAR',
    sizes: ['2 inch', '3 inch', '4 inch', '6 inch'], purchase_price: 60, selling_price: 90, discount: 0,
    offer: '', bonus: '', stock: 90, sold: 240, low_stock_alert: 20, status: 'active', featured: false,
    created_at: hoursAgo(90),
  },
  {
    id: 'p16', name: 'Medical Adhesive Tape',
    description: 'Hypoallergenic microporous medical adhesive tape for securing dressings and bandages. Per roll.',
    images: [], category: 'Dressings & Bandages', brand: '', sku: 'TAP-VAR',
    sizes: ['1/2 inch', '1 inch', '2 inch'], purchase_price: 25, selling_price: 40, discount: 0,
    offer: '', bonus: '', stock: 70, sold: 160, low_stock_alert: 15, status: 'active', featured: false,
    created_at: hoursAgo(85),
  },
  {
    id: 'p17', name: 'Alcohol Swabs (Box of 100)',
    description: '70% isopropyl alcohol prep pads, individually wrapped. Box of 100 swabs for disinfection.',
    images: [], category: 'Dressings & Bandages', brand: '', sku: 'ALS-100',
    sizes: ['Standard'], purchase_price: 95, selling_price: 140, discount: 0,
    offer: '', bonus: 'Buy 10 boxes, get 1 box FREE', stock: 50, sold: 190, low_stock_alert: 10,
    status: 'active', featured: false, created_at: hoursAgo(80),
  },
  {
    id: 'p18', name: 'Nasal Oxygen Cannula (Adult)',
    description: 'Soft adult nasal oxygen cannula with 2 meter star lumen tubing and universal connector.',
    images: [], category: 'Respiratory', brand: '', sku: 'O2C-ADULT',
    sizes: ['Adult'], purchase_price: 120, selling_price: 170, discount: 0,
    offer: '', bonus: '', stock: 0, sold: 40, low_stock_alert: 10, status: 'active', featured: false,
    created_at: hoursAgo(70),
  },
  {
    id: 'p19', name: 'Nebulizer Mask Kit',
    description: 'Nebulizer mask kit with chamber, tubing and elastic strap. Choose adult or child size.',
    images: [], category: 'Respiratory', brand: '', sku: 'NEB-MASK',
    sizes: ['Adult', 'Child'], purchase_price: 110, selling_price: 160, discount: 0,
    offer: '', bonus: '', stock: 28, sold: 55, low_stock_alert: 8, status: 'active', featured: false,
    created_at: hoursAgo(60),
  },
  {
    id: 'p20', name: 'Digital Thermometer',
    description: 'Fast reading waterproof digital thermometer with LCD display and fever alert beep.',
    images: [img('thermometer.jpg')], category: 'Diagnostics', brand: '', sku: 'DTH-01',
    sizes: ['Standard'], purchase_price: 95, selling_price: 180, discount: 10,
    offer: 'Special price', bonus: '', stock: 35, sold: 85, low_stock_alert: 10,
    status: 'active', featured: true, created_at: hoursAgo(50),
  },
]

const defaultSettings = {
  id: 1,
  store_name: 'Gumeli Surgical',
  logo_url: '',
  phone: '+92 300 1234567',
  whatsapp: '923001234567',
  address: 'Medical Market, M.A. Jinnah Road',
  city: 'Karachi',
  footer_text: 'Wholesale Medical & Surgical Supplies. Prices may change without prior notice.',
}

function buildSeedOrders(products) {
  const orders = []
  const order_items = []
  const byId = Object.fromEntries(products.map((p) => [p.id, p]))

  const make = (num, hAgo, status, customer, shop, phone, city, lines) => {
    const id = `seed-o${num}`
    let total = 0
    lines.forEach((ln, idx) => {
      const p = byId[ln.pid]
      const size = ln.size || p.sizes[0]
      const itemTotal = p.selling_price * ln.qty
      total += itemTotal
      order_items.push({
        id: `seed-i${num}-${idx}`,
        order_id: id,
        product_id: p.id,
        product_name: p.name,
        size,
        quantity: ln.qty,
        purchase_price: p.purchase_price,
        selling_price: p.selling_price,
        total: itemTotal,
      })
    })
    orders.push({
      id,
      order_number: `GS-${1000 + num}`,
      customer_name: customer,
      shop_name: shop,
      phone,
      whatsapp: phone,
      city,
      address: shop ? `Near ${shop}, Main Bazaar` : 'Main Bazaar',
      notes: '',
      subtotal: total,
      discount: 0,
      total,
      status,
      created_at: hoursAgo(hAgo),
    })
  }

  make(1, 3, 'Pending', 'Ahmed Raza', 'City Medical Store', '0301 4455667', 'Lahore', [
    { pid: 'p3', qty: 2 }, { pid: 'p20', qty: 1 },
  ])
  make(2, 6, 'Confirmed', 'Sana Tariq', 'Al-Shifa Clinic', '0333 7788990', 'Karachi', [
    { pid: 'p1', size: 'Medium', qty: 3 }, { pid: 'p11', size: '16Fr', qty: 10 },
  ])
  make(3, 26, 'Delivered', 'Usman Ghani', 'Ghani Medical Hall', '0345 1122334', 'Faisalabad', [
    { pid: 'p7', size: '22G', qty: 2 }, { pid: 'p9', qty: 5 },
  ])
  make(4, 30, 'Cancelled', 'Imran Sheikh', '', '0300 9988776', 'Multan', [
    { pid: 'p4', qty: 1 },
  ])
  make(5, 75, 'Delivered', 'Bilal Ahmed', 'Sehat Pharmacy', '0321 5566778', 'Rawalpindi', [
    { pid: 'p15', size: '4 inch', qty: 5 }, { pid: 'p13', qty: 4 }, { pid: 'p17', qty: 2 },
  ])

  return { orders, order_items }
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const seed = buildSeedOrders(seedProducts)
  const db = {
    products: seedProducts,
    orders: seed.orders,
    order_items: seed.order_items,
    settings: { ...defaultSettings },
    counter: 1005,
  }
  save(db)
  return db
}

function save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

const delay = (data, ms = 150) => new Promise((res) => setTimeout(() => res(data), ms))

const demoApi = {
  demo: true,
  credentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },

  // ---------------- Auth ----------------
  async signIn(email, password) {
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(SESSION_KEY, '1')
      this._cb && this._cb({ user: { email: DEMO_EMAIL } })
      return { user: { email: DEMO_EMAIL } }
    }
    throw new Error('Invalid email or password')
  },
  async signOut() {
    localStorage.removeItem(SESSION_KEY)
    this._cb && this._cb(null)
  },
  async getSession() {
    return localStorage.getItem(SESSION_KEY) ? { user: { email: DEMO_EMAIL } } : null
  },
  onAuthChange(cb) {
    this._cb = cb
    return () => { this._cb = null }
  },

  // ---------------- Settings ----------------
  async getSettings() {
    return { ...load().settings }
  },
  async saveSettings(patch) {
    const db = load()
    db.settings = { ...db.settings, ...patch, id: 1, updated_at: new Date().toISOString() }
    save(db)
    return db.settings
  },

  // ---------------- Products ----------------
  async getProducts(activeOnly = false) {
    const list = load().products.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))
    return delay(activeOnly ? list.filter((p) => p.status === 'active') : list)
  },
  async getProduct(id) {
    return load().products.find((p) => p.id === id) || null
  },
  async saveProduct(product) {
    const db = load()
    const idx = db.products.findIndex((p) => p.id === product.id)
    if (idx >= 0) db.products[idx] = { ...db.products[idx], ...product }
    else db.products.unshift({ ...product, created_at: new Date().toISOString() })
    save(db)
    return product
  },
  async deleteProduct(id) {
    const db = load()
    db.products = db.products.filter((p) => p.id !== id)
    save(db)
  },
  async uploadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  // ---------------- Orders ----------------
  async createOrder(order, items) {
    const db = load()
    db.counter += 1
    const order_number = `GS-${db.counter}`
    const full = { ...order, id: `o${Date.now()}`, order_number, status: 'Pending', created_at: new Date().toISOString() }
    db.orders.unshift(full)
    items.forEach((it, i) => {
      const p = db.products.find((x) => x.id === it.product_id)
      db.order_items.push({
        ...it,
        product_name: it.product_name || p?.name || 'Product',
        purchase_price: (!it.purchase_price && p) ? p.purchase_price : it.purchase_price,
        id: `i${Date.now()}-${i}`,
        order_id: full.id,
      })
    })
    save(db)
    return { order: full, items }
  },
  async getOrders() {
    const db = load()
    return db.orders.map((o) => ({
      ...o,
      items: db.order_items.filter((i) => i.order_id === o.id),
    }))
  },
  async getOrder(id) {
    const db = load()
    const order = db.orders.find((o) => o.id === id)
    if (!order) return null
    return { ...order, items: db.order_items.filter((i) => i.order_id === id) }
  },
  async setOrderStatus(id, status) {
    const db = load()
    const order = db.orders.find((o) => o.id === id)
    if (!order) return
    const items = db.order_items.filter((i) => i.order_id === id)
    const wasDelivered = order.status === 'Delivered'
    const nowDelivered = status === 'Delivered'

    if (!wasDelivered && nowDelivered) {
      items.forEach((it) => {
        const p = db.products.find((x) => x.id === it.product_id)
        if (p) { p.stock = Math.max(0, p.stock - it.quantity); p.sold += it.quantity }
      })
    } else if (wasDelivered && !nowDelivered) {
      items.forEach((it) => {
        const p = db.products.find((x) => x.id === it.product_id)
        if (p) { p.stock += it.quantity; p.sold = Math.max(0, p.sold - it.quantity) }
      })
    }
    order.status = status
    save(db)
    return order
  },
}

export default demoApi
