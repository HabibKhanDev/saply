import { supabase, isSupabaseConfigured } from './supabase'
import demo from './demo'

export const demoMode = !isSupabaseConfigured

// Public-safe product columns (purchase_price is intentionally excluded).
const PUBLIC_COLUMNS =
  'id,name,description,images,category,brand,sku,sizes,selling_price,discount,offer,bonus,stock,low_stock_alert,status,featured,created_at'

const normalizeProduct = (p) => ({
  ...p,
  images: Array.isArray(p.images) ? p.images : [],
  sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['Standard'],
  purchase_price: Number(p.purchase_price || 0),
  selling_price: Number(p.selling_price || 0),
  discount: Number(p.discount || 0),
  stock: Number(p.stock || 0),
  sold: Number(p.sold || 0),
  low_stock_alert: Number(p.low_stock_alert ?? 5),
  featured: Boolean(p.featured),
})

// =====================================================================
// SUPABASE BACKEND
// =====================================================================
const sb = {
  // ---------------- Auth ----------------
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) throw error
      return data
    }),
  signOut: () => supabase.auth.signOut(),
  getSession: () =>
    supabase.auth.getSession().then(({ data }) => data.session),
  onAuthChange: (cb) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
    return () => data.subscription.unsubscribe()
  },

  // ---------------- Settings ----------------
  async getSettings() {
    const { data, error } = await supabase
      .from('admin_settings').select('*').eq('id', 1).maybeSingle()
    if (error) throw error
    return data || null
  },
  async saveSettings(patch) {
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({ ...patch, id: 1, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ---------------- Products ----------------
  async getProducts(activeOnly = false) {
    let query = supabase.from('products').select(activeOnly ? PUBLIC_COLUMNS : '*')
    if (activeOnly) query = query.eq('status', 'active')
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(normalizeProduct)
  },
  async getProduct(id) {
    const { data, error } = await supabase
      .from('products').select(PUBLIC_COLUMNS).eq('id', id).maybeSingle()
    if (error) throw error
    return data ? normalizeProduct(data) : null
  },
  async saveProduct(product) {
    const row = normalizeProduct(product)
    const { error } = await supabase.from('products').upsert(row)
    if (error) throw error
    return row
  },
  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
  async uploadImage(file, folder = 'products') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${folder}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('store-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('store-images').getPublicUrl(path)
    return data.publicUrl
  },

  // ---------------- Orders ----------------
  async createOrder(order, items) {
    let order_number
    const rpc = await supabase.rpc('next_order_number')
    if (!rpc.error && rpc.data) {
      order_number = rpc.data
    } else {
      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
      order_number = `GS-${1001 + (count || 0)}`
    }

    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({ ...order, order_number, status: 'Pending' })
      .select()
      .single()
    if (orderError) throw orderError

    const itemRows = items.map((it) => ({ ...it, order_id: orderRow.id }))
    const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
    if (itemsError) throw itemsError

    return { order: orderRow, items }
  },
  async getOrders() {
    const { data: orders, error } = await supabase
      .from('orders').select('*').order('created_at', { ascending: false })
    if (error) throw error
    const { data: items, error: ie } = await supabase.from('order_items').select('*')
    if (ie) throw ie
    return (orders || []).map((o) => ({
      ...o,
      items: (items || []).filter((i) => i.order_id === o.id),
    }))
  },
  async getOrder(id) {
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
    if (error || !order) return null
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id)
    return { ...order, items: items || [] }
  },
  async setOrderStatus(id, status) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id)
    if (!order) return
    const wasDelivered = order.status === 'Delivered'
    const nowDelivered = status === 'Delivered'

    if (!wasDelivered && nowDelivered) {
      for (const it of items || []) {
        if (!it.product_id) continue
        const { data: p } = await supabase.from('products').select('id,stock,sold').eq('id', it.product_id).maybeSingle()
        if (p) {
          await supabase.from('products').update({
            stock: Math.max(0, (p.stock || 0) - it.quantity),
            sold: (p.sold || 0) + it.quantity,
          }).eq('id', p.id)
        }
      }
    } else if (wasDelivered && !nowDelivered) {
      for (const it of items || []) {
        if (!it.product_id) continue
        const { data: p } = await supabase.from('products').select('id,stock,sold').eq('id', it.product_id).maybeSingle()
        if (p) {
          await supabase.from('products').update({
            stock: (p.stock || 0) + it.quantity,
            sold: Math.max(0, (p.sold || 0) - it.quantity),
          }).eq('id', p.id)
        }
      }
    }
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) throw error
  },
}

export default demoMode ? demo : sb
