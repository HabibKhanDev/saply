import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'
import { money } from '../../lib/format'
import { ImageIcon, TrashIcon, ArrowLeftIcon, PlusIcon, CheckIcon, StarIcon } from '../../components/icons'

const blank = {
  id: '',
  name: '',
  description: '',
  images: [],
  category: '',
  brand: '',
  sku: '',
  sizesText: '',
  purchase_price: '',
  selling_price: '',
  discount: '',
  offer: '',
  bonus: '',
  stock: '',
  low_stock_alert: 5,
  status: 'active',
  featured: false,
}

export default function ProductForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(blank)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getProducts(false).then((all) => {
      setCategories([...new Set(all.map((p) => p.category))].sort())
      if (editing) {
        const p = all.find((x) => x.id === id)
        if (p) {
          setForm({
            ...blank,
            ...p,
            sizesText: (p.sizes || []).join('\n'),
          })
        }
      }
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const buy = Number(form.purchase_price) || 0
  const sell = Number(form.selling_price) || 0
  const disc = Number(form.discount) || 0
  const profit = sell - buy
  const margin = buy > 0 ? ((sell - buy) / buy) * 100 : 0
  const finalPrice = disc > 0 ? Math.round(sell * (1 - disc / 100)) : sell

  const handleImages = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files) {
        const url = await api.uploadImage(file, 'products')
        urls.push(url)
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } catch (err) {
      setError('Image upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const makeMain = (i) =>
    setForm((f) => {
      const imgs = [...f.images]
      const [chosen] = imgs.splice(i, 1)
      imgs.unshift(chosen)
      return { ...f, images: imgs }
    })

  const save = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Please enter the product name.')
    if (sell <= 0) return setError('Please enter the selling price.')

    const sizes = form.sizesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    const product = {
      id: editing ? id : crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      images: form.images,
      category: form.category.trim() || 'General',
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      sizes: sizes.length ? sizes : ['Standard'],
      purchase_price: buy,
      selling_price: sell,
      discount: disc,
      offer: form.offer.trim(),
      bonus: form.bonus.trim(),
      stock: parseInt(form.stock) || 0,
      low_stock_alert: parseInt(form.low_stock_alert) || 0,
      status: form.status,
      featured: Boolean(form.featured),
    }
    setSaving(true)
    try {
      await api.saveProduct(product)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'Could not save product.')
      setSaving(false)
    }
  }

  const del = async () => {
    if (!window.confirm('Delete this product permanently?')) return
    await api.deleteProduct(id)
    navigate('/admin/products')
  }

  const profitColor = profit >= 0 ? 'text-emerald-700' : 'text-red-600'

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading product…</div>
  }

  return (
    <div className="p-3.5 pb-10">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm mb-2">
        <ArrowLeftIcon size={17} /> All products
      </Link>
      <h1 className="font-display text-xl font-bold text-slate-900 mb-3">
        {editing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={save} className="space-y-3.5">
        {/* Images */}
        <div className="card p-4">
          <h2 className="font-bold text-slate-800 mb-2">Product Images</h2>
          <p className="text-xs text-slate-500 mb-3">
            The first image is shown as the main picture. Upload directly from your phone gallery.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {form.images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    MAIN
                  </span>
                )}
                <div className="absolute bottom-1 right-1 flex gap-1">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeMain(i)} title="Make main"
                      className="bg-white/95 w-7 h-7 rounded-lg flex items-center justify-center text-teal-700 shadow">
                      <StarIcon size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} title="Remove"
                    className="bg-white/95 w-7 h-7 rounded-lg flex items-center justify-center text-red-600 shadow">
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer bg-slate-50 active:bg-slate-100">
              {uploading ? (
                <div className="w-7 h-7 border-[3px] border-teal-200 border-t-teal-700 rounded-full animate-spin" />
              ) : (
                <>
                  <ImageIcon size={26} />
                  <span className="text-[10.5px] font-bold mt-1 text-center px-1">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            </label>
          </div>
        </div>

        {/* Basic details */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-slate-800">Product Details</h2>
          <div>
            <label className="field-label">Product Name *</label>
            <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Examination Gloves (Box of 100)" />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea className="field" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Short description, material, pack size, usage…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Category</label>
              <input className="field" list="cat-list" value={form.category} onChange={(e) => set('category', e.target.value)}
                placeholder="e.g. Gloves" />
              <datalist id="cat-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="field-label">Brand (optional)</label>
              <input className="field" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Brand" />
            </div>
          </div>
          <div>
            <label className="field-label">Product Code / SKU (optional)</label>
            <input className="field" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="e.g. GLV-EX-100" />
          </div>
          <div>
            <label className="field-label">Available Sizes (one per line)</label>
            <textarea className="field" rows={3} value={form.sizesText} onChange={(e) => set('sizesText', e.target.value)}
              placeholder={'Small\nMedium\nLarge'} />
            <p className="text-[11px] text-slate-400 mt-1">Or sizes like: 2 inch, 4 inch, 6 inch</p>
          </div>
        </div>

        {/* Pricing (PRIVATE) */}
        <div className="card p-4 space-y-3 border-amber-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Pricing &amp; Stock</h2>
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Private — admin only
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Purchase Price (Rs.)</label>
              <input type="number" min="0" step="any" className="field" value={form.purchase_price}
                onChange={(e) => set('purchase_price', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="field-label">Selling Price (Rs.) *</label>
              <input type="number" min="0" step="any" className="field" value={form.selling_price}
                onChange={(e) => set('selling_price', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Auto profit / margin */}
          <div className={`rounded-xl border p-3 text-sm ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">Profit / Unit</div>
                <div className={`font-extrabold ${profitColor}`}>{money(Math.max(profit, 0))}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">Margin</div>
                <div className={`font-extrabold ${profitColor}`}>{margin.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">After Discount</div>
                <div className="font-extrabold text-slate-800">{money(finalPrice)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Discount % (optional)</label>
              <input type="number" min="0" max="99" step="any" className="field" value={form.discount}
                onChange={(e) => set('discount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="field-label">Stock Quantity</label>
              <input type="number" min="0" step="1" className="field" value={form.stock}
                onChange={(e) => set('stock', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="field-label">Low Stock Alert At</label>
            <input type="number" min="0" className="field" value={form.low_stock_alert}
              onChange={(e) => set('low_stock_alert', e.target.value)} placeholder="5" />
          </div>
        </div>

        {/* Offers */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-slate-800">Offers (optional)</h2>
          <div>
            <label className="field-label">Offer Text</label>
            <input className="field" value={form.offer} onChange={(e) => set('offer', e.target.value)}
              placeholder="e.g. Limited wholesale price" />
          </div>
          <div>
            <label className="field-label">Bonus</label>
            <input className="field" value={form.bonus} onChange={(e) => set('bonus', e.target.value)}
              placeholder="e.g. Buy 10 get 1 FREE" />
          </div>
        </div>

        {/* Visibility */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-slate-800">Visibility</h2>
          <div>
            <label className="field-label">Product Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set('status', 'active')}
                className={`btn ${form.status === 'active' ? 'btn-teal' : 'btn-ghost'}`}>
                {form.status === 'active' && <CheckIcon size={17} />} Active
              </button>
              <button type="button" onClick={() => set('status', 'hidden')}
                className={`btn ${form.status === 'hidden' ? 'btn-teal' : 'btn-ghost'}`}>
                {form.status === 'hidden' && <CheckIcon size={17} />} Hidden
              </button>
            </div>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-teal-700" checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)} />
            <span className="text-sm font-semibold text-slate-700">⭐ Featured product (shown first on home page)</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button type="submit" disabled={saving || uploading} className="btn btn-teal py-3.5">
            {saving ? 'Saving…' : <><PlusIcon size={18} /> Save Product</>}
          </button>
          {editing ? (
            <button type="button" onClick={del} className="btn btn-danger py-3.5">
              <TrashIcon size={18} /> Delete
            </button>
          ) : (
            <Link to="/admin/products" className="btn btn-ghost py-3.5">Cancel</Link>
          )}
        </div>
      </form>
    </div>
  )
}
