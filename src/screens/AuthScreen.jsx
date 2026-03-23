import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
  const { t, i18n } = useTranslation()
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
        navigate('/onboarding')
      } else {
        await signIn(email, password)
        navigate('/home')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Language selector */}
      <div className="flex justify-end px-6 pt-4">
        <select
          className="text-xs text-outline bg-transparent border border-outline-variant rounded-full px-3 py-1 focus:outline-none"
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="ms">Bahasa Melayu</option>
          <option value="th">ภาษาไทย</option>
          <option value="ko">한국어</option>
          <option value="fil">Filipino</option>
          <option value="zh">中文</option>
        </select>
      </div>

      {/* Header */}
      <div className="px-6 pt-8 pb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2"
          style={{ color: '#49624d' }}>
          Maganda
        </h1>
        <p className="text-sm text-on-surface-variant">
          Know what you put on your body.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">

        {/* Mode toggle */}
        <div
          className="flex gap-2 mb-8 p-1 rounded-xl"
          style={{ backgroundColor: '#eceeed' }}
        >
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              style={mode === m ? { backgroundColor: '#ffffff', color: '#49624d' } : { color: '#737972' }}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all"
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl py-4 px-5 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: '#ffffff', border: '2px solid #e1e3e2' }}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            Password
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

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: '#ffdad6' }}
          >
            <p className="text-xs font-medium" style={{ color: '#93000a' }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: '#49624d', color: '#ffffff' }}
          className="w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-40"
        >
          {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        {/* Terms note */}
        {mode === 'signup' && (
          <p className="text-xs text-on-surface-variant text-center mt-4 leading-relaxed">
            By creating an account you agree to our terms of service and privacy policy.
          </p>
        )}
      </div>
    </div>
  )
}