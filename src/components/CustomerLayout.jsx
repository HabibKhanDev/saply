import { Link, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useApp } from '../context/AppContext'
import Logo from './Logo'
import { CartIcon, WhatsAppIcon, PhoneIcon, PinIcon } from './icons'

export default function CustomerLayout() {
  const { count } = useCart()
  const { settings } = useApp()
  const { pathname } = useLocation()
  const hideFloat = pathname === '/cart' || pathname === '/checkout'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <Logo src={settings.logo_url} size={40} />
            <div className="min-w-0">
              <div className="font-display font-extrabold text-teal-800 leading-tight text-[17px] truncate">
                {settings.store_name}
              </div>
              <div className="text-[10.5px] text-slate-500 leading-tight truncate">
                Medical &amp; Surgical Wholesale
              </div>
            </div>
          </Link>

          <div className="ml-auto">
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-700 text-white shadow-sm"
              aria-label="Cart"
            >
              <CartIcon size={22} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-teal-900 text-teal-50 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm">
          <div className="flex items-center gap-3">
            <Logo src={settings.logo_url} size={44} rounded="xl" />
            <div>
              <div className="font-display font-bold text-base text-white">{settings.store_name}</div>
              <div className="text-teal-200 text-xs">Medical &amp; Surgical Wholesale</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-teal-100 text-[13px]">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white">
                <PhoneIcon size={15} /> {settings.phone}
              </a>
            )}
            {(settings.address || settings.city) && (
              <div className="flex items-start gap-2">
                <PinIcon size={15} className="mt-0.5 shrink-0" />
                <span>{[settings.address, settings.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
          <p className="mt-5 text-[11.5px] text-teal-300 border-t border-teal-800 pt-4">
            {settings.footer_text}
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      {!hideFloat && (
        <a
          href={`https://wa.me/${(settings.whatsapp || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(
            `Assalam o Alaikum ${settings.store_name}, I need information about medical/surgical products.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-4 z-40 w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-lg shadow-green-600/30"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon size={30} />
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-40 animate-ping" />
        </a>
      )}
    </div>
  )
}
