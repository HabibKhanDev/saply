import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { ChartIcon, SettingsIcon, LogoutIcon, BoxIcon, OrdersIcon, ReceiptIcon } from '../../components/icons'
import { useApp } from '../../context/AppContext'

export default function MoreMenu() {
  const navigate = useNavigate()
  const { settings, demoMode } = useApp()

  const logout = async () => {
    await api.signOut()
    window.location.href = '/admin/login'
  }

  const links = [
    { to: '/admin/products', label: 'Product Management', icon: BoxIcon, color: 'bg-teal-50 text-teal-700' },
    { to: '/admin/orders', label: 'Order History', icon: OrdersIcon, color: 'bg-blue-50 text-blue-700' },
    { to: '/admin/billing', label: 'Billing / Invoices', icon: ReceiptIcon, color: 'bg-violet-50 text-violet-700' },
    { to: '/admin/sales', label: 'Sales History & Profit', icon: ChartIcon, color: 'bg-emerald-50 text-emerald-700' },
    { to: '/admin/settings', label: 'Store Settings', icon: SettingsIcon, color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="p-4">
      <h1 className="font-display text-xl font-bold text-slate-900 mb-1">More</h1>
      <p className="text-sm text-slate-500 mb-4">{settings.store_name}</p>

      {demoMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 mb-4">
          DEMO MODE — data is stored only on this device. Add Supabase keys (.env) to use the cloud database.
        </div>
      )}

      <div className="space-y-2.5">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="card p-4 flex items-center gap-3 active:bg-slate-50">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${l.color}`}>
              <l.icon size={21} />
            </span>
            <span className="font-bold text-slate-800">{l.label}</span>
            <span className="ml-auto text-slate-300">›</span>
          </Link>
        ))}

        <button onClick={logout} className="card p-4 w-full flex items-center gap-3 text-red-600 active:bg-red-50">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
            <LogoutIcon size={21} />
          </span>
          <span className="font-bold">Logout</span>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-6">
        Gumeli Surgical Admin · Customer store is at <span className="font-mono" onClick={() => navigate('/')}>/</span>
      </p>
    </div>
  )
}
