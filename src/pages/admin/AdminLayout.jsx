import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useApp } from '../../context/AppContext'
import { HomeIcon, BoxIcon, OrdersIcon, ReceiptIcon, MoreIcon, LogoutIcon } from '../../components/icons'

const tabs = [
  { to: '/admin', label: 'Home', icon: HomeIcon, end: true },
  { to: '/admin/products', label: 'Products', icon: BoxIcon },
  { to: '/admin/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/admin/billing', label: 'Billing', icon: ReceiptIcon },
  { to: '/admin/more', label: 'More', icon: MoreIcon },
]

export default function AdminLayout() {
  const { settings } = useApp()
  const navigate = useNavigate()

  const logout = async () => {
    await api.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow">
        <div className="max-w-5xl mx-auto px-3 h-14 flex items-center gap-2">
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[15px] leading-tight truncate">
              {settings.store_name}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-teal-200 font-bold">
              Admin Panel
            </div>
          </div>
          <button onClick={logout} className="ml-auto flex items-center gap-1.5 bg-teal-700/70 hover:bg-teal-700 rounded-xl px-3 py-2 text-[13px] font-bold">
            <LogoutIcon size={17} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <Outlet />
      </div>

      {/* Bottom navigation (mobile first, large touch targets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto grid grid-cols-5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-bold ${
                  isActive ? 'text-teal-700' : 'text-slate-500'
                }`
              }
            >
              <t.icon size={22} />
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
