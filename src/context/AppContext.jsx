import { createContext, useContext, useEffect, useState } from 'react'
import api, { demoMode } from '../lib/api'

export const DEFAULT_SETTINGS = {
  store_name: 'Gumeli Surgical',
  logo_url: '',
  phone: '+92 300 1234567',
  whatsapp: '923001234567',
  address: 'Medical Market, M.A. Jinnah Road',
  city: 'Karachi',
  footer_text: 'Wholesale Medical & Surgical Supplies. Prices may change without prior notice.',
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    api.getSettings()
      .then((row) => row && setSettings({ ...DEFAULT_SETTINGS, ...row }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    api.getSession()
      .then((s) => active && setSession(s))
      .finally(() => active && setAuthLoading(false))
    const unsub = api.onAuthChange((s) => setSession(s))
    return () => {
      active = false
      unsub && unsub()
    }
  }, [])

  const updateSettings = async (patch) => {
    const saved = await api.saveSettings(patch)
    setSettings((prev) => ({ ...prev, ...saved }))
    return saved
  }

  return (
    <AppContext.Provider
      value={{ settings, setSettings, updateSettings, session, authLoading, demoMode }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
