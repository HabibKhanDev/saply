import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import api, { demoMode } from '../../lib/api'
import { useApp } from '../../context/AppContext'
import Logo from '../../components/Logo'
import { LockIcon } from '../../components/iconsLock'

export default function AdminLogin() {
  const { session, settings } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.signIn(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-emerald-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5 text-white">
          <div className="flex justify-center mb-3">
            <Logo src={settings.logo_url} size={64} rounded="2xl" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">{settings.store_name}</h1>
          <p className="text-teal-200 text-sm">Admin Panel — Sign in to continue</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-bold">
            <LockIcon size={20} /> Admin Login
          </div>

          {demoMode && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[12.5px] rounded-xl p-3 leading-relaxed">
              <b>DEMO MODE</b> — Supabase is not configured. Orders/products are stored on this
              device only.
              <div className="mt-1 font-semibold">
                Email: admin@gumeli.com<br />Password: demo1234
              </div>
            </div>
          )}

          <div>
            <label className="field-label">Email / Username</label>
            <input
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn btn-teal w-full">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link to="/" className="text-teal-100 text-sm hover:text-white">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
