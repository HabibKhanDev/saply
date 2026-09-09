import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { session, authLoading } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-teal-700">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading admin…</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
