'use client'

import { useState, useTransition } from 'react'
import { X, KeyRound, Eye, EyeOff } from 'lucide-react'
import { changePasswordAction } from '@/app/actions/auth'

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await changePasswordAction(fd)
      if (res?.error) { setError(res.error); return }
      setSuccess(true)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-sky-400" />
            <h2 className="font-semibold text-white text-sm">Change Password</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20 flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">Password updated</p>
              <p className="text-slate-400 text-sm mt-1">Your new password is active.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <input
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 pr-9 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-9 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 pr-9 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {pending ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
