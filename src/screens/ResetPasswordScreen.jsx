import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { clearRecoveryMode } = useAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setError(null)
    if (!password || !confirm) {
      setError(t('reset_password.error_required'))
      return
    }
    if (password !== confirm) {
      setError(t('reset_password.error_mismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('reset_password.error_too_short'))
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      clearRecoveryMode()
      setTimeout(() => navigate('/profile', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || t('reset_password.error_generic'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <div className="px-6 pt-8 pb-12">
        <h1
          className="font-headline text-4xl font-extrabold tracking-tight mb-2"
          style={{ color: '#49624d' }}
        >
          Maganda
        </h1>
      </div>

      <div className="flex-1 px-6">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
          {t('reset_password.title')}
        </h2>
        <p className="text-sm text-on-surface-variant mb-8">
          {t('reset_password.subtitle')}
        </p>

        {success ? (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#ceeacf' }}>
            <p className="text-sm font-medium" style={{ color: '#1a3a20' }}>
              {t('reset_password.success')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                {t('reset_password.new_password_label')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl py-4 px-5 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#ffffff', border: '2px solid #e1e3e2' }}
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                {t('reset_password.confirm_password_label')}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl py-4 px-5 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#ffffff', border: '2px solid #e1e3e2' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#ffdad6' }}>
                <p className="text-xs font-medium" style={{ color: '#93000a' }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#49624d', color: '#ffffff' }}
              className="w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-40"
            >
              {loading ? '...' : t('reset_password.submit')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
