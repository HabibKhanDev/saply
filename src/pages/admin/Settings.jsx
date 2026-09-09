import { useState } from 'react'
import api from '../../lib/api'
import { useApp } from '../../context/AppContext'
import Logo from '../../components/Logo'
import { ImageIcon, CheckIcon } from '../../components/icons'

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await api.uploadImage(file, 'settings')
      setForm((f) => ({ ...f, logo_url: url }))
    } catch (err) {
      setError('Logo upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateSettings({
        store_name: form.store_name || 'Gumeli Surgical',
        logo_url: form.logo_url || '',
        phone: form.phone || '',
        whatsapp: (form.whatsapp || '').replace(/[^\d]/g, ''),
        address: form.address || '',
        city: form.city || '',
        footer_text: form.footer_text || '',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-3.5 pb-10">
      <h1 className="font-display text-xl font-bold text-slate-900">Store Settings</h1>
      <p className="text-sm text-slate-500 mb-4">Shown on your store and printed bills.</p>

      <form onSubmit={save} className="space-y-3.5">
        <div className="card p-4">
          <h2 className="font-bold text-slate-800 mb-3">Store Logo</h2>
          <div className="flex items-center gap-4">
            <Logo src={form.logo_url} size={72} rounded="2xl" />
            <label className="btn btn-light cursor-pointer">
              {uploading ? (
                <span className="w-5 h-5 border-[3px] border-teal-200 border-t-teal-700 rounded-full animate-spin" />
              ) : (
                <ImageIcon size={18} />
              )}
              Change Logo
              <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
            </label>
            {form.logo_url && (
              <button type="button" className="text-sm text-red-600 font-bold"
                onClick={() => setForm((f) => ({ ...f, logo_url: '' }))}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-slate-800">Store Information</h2>
          <div>
            <label className="field-label">Store Name</label>
            <input className="field" value={form.store_name} onChange={set('store_name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Phone</label>
              <input className="field" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="+92 300 …" />
            </div>
            <div>
              <label className="field-label">WhatsApp Number (with country code)</label>
              <input className="field" inputMode="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="923001234567" />
              <p className="text-[11px] text-slate-400 mt-1">Digits only, e.g. 923001234567</p>
            </div>
          </div>
          <div>
            <label className="field-label">City</label>
            <input className="field" value={form.city} onChange={set('city')} />
          </div>
          <div>
            <label className="field-label">Address</label>
            <textarea className="field" rows={2} value={form.address} onChange={set('address')} />
          </div>
          <div>
            <label className="field-label">Footer Text (bills &amp; website)</label>
            <textarea className="field" rows={2} value={form.footer_text} onChange={set('footer_text')} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit" disabled={saving || uploading} className="btn btn-teal w-full py-3.5">
          {saved ? <><CheckIcon size={18} /> Saved!</> : saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
