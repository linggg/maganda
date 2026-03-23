import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ProfileNudge from '../components/home/ProfileNudge'

const ANONYMOUS_NAMES = ['Ingredient Check', 'User submitted product', 'Scanned product']

function isAnonymous(name) {
  return !name || ANONYMOUS_NAMES.includes(name)
}

function getDisplayName(product) {
  if (!product) return 'Ingredient Check'
  if (isAnonymous(product.name)) return 'Ingredient Check'
  return product.name
}

const SAFETY_COLORS = {
  safe:    { bg: '#ceeacf', text: '#1a4d2e' },
  caution: { bg: '#fef3c7', text: '#92400e' },
  avoid:   { bg: '#ffdad6', text: '#ba1a1a' },
}

function safetyStyle(verdict) {
  const v = (verdict || '').toLowerCase()
  if (v === 'safe') return SAFETY_COLORS.safe
  if (v === 'caution' || v === 'moderate') return SAFETY_COLORS.caution
  return SAFETY_COLORS.avoid
}

function safetyLabel(verdict, t) {
  const v = (verdict || '').toLowerCase()
  if (v === 'safe') return t('assessment.verdict_safe')
  if (v === 'caution' || v === 'moderate') return t('assessment.verdict_caution')
  return t('assessment.verdict_risk')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('home.good_morning')
  if (h < 18) return t('home.good_afternoon')
  return t('home.good_evening')
}

function SkeletonCard({ tall }) {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8' }}
    >
      <div className="h-2 w-20 rounded mb-3" style={{ backgroundColor: '#eceeed' }} />
      <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: '#eceeed' }} />
      {tall && <div className="h-3 w-1/2 rounded mt-1" style={{ backgroundColor: '#eceeed' }} />}
    </div>
  )
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [assessmentCount, setAssessmentCount] = useState(0)
  const [lastAssessment, setLastAssessment] = useState(null)
  const [verdictCounts, setVerdictCounts] = useState({ liked: 0, want_to_try: 0, avoid: 0 })

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return }

    Promise.all([
      supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id),
      supabase
        .from('assessments')
        .select('id, safety_verdict, created_at, products(id, name, brand, raw_ingredients, parsed_ingredients)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1),
      Promise.all([
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).eq('user_verdict', 'liked'),
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).eq('user_verdict', 'want_to_try'),
        supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).eq('user_verdict', 'avoid'),
      ]),
    ]).then(([{ count }, { data: recent }, [{ count: liked }, { count: want_to_try }, { count: avoid }]]) => {
      setAssessmentCount(count || 0)
      setLastAssessment(recent?.[0] || null)
      setVerdictCounts({ liked: liked || 0, want_to_try: want_to_try || 0, avoid: avoid || 0 })
      setLoading(false)
    })
  }, [profile?.id])

  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name
  const greeting = getGreeting(t)
  const isNewUser = !loading && assessmentCount === 0

  function handleLastAssessmentTap() {
    const product = lastAssessment?.products
    if (!product) return
    navigate(`/assessment/${product.id}`, {
      state: {
        productId: product.id,
        productName: isAnonymous(product.name) ? 'Ingredient Check' : product.name,
        brand: product.brand,
        ingredients: product.raw_ingredients || '',
        parsed: product.parsed_ingredients || [],
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Fixed top app bar */}
      <header
        className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 flex items-center justify-center px-6"
        style={{
          height: 64,
          backgroundColor: 'rgba(248,250,249,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e6e9e8',
        }}
      >
        <h1 className="font-headline font-extrabold text-xl" style={{ color: '#49624d' }}>
          Maganda
        </h1>
      </header>

      {/* Scrollable content */}
      <main className="pt-24 pb-32 px-6 space-y-4">

        {/* Hero card — shared structure, two variants */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ backgroundColor: '#f2f4f3' }}
        >
          {/* Decorative blur blob */}
          <div
            className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: 'rgba(73,98,77,0.12)' }}
          />

          {/* Label */}
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3 relative"
            style={{ color: '#775259' }}
          >
            {isNewUser
              ? 'PERSONALISED FOR YOU'
              : `${greeting.toUpperCase()}${displayName ? `, ${displayName.toUpperCase()}` : ''}`}
          </p>

          {/* Headline */}
          <h2
            className="font-headline font-extrabold text-4xl leading-tight mb-3 relative"
            style={{ color: '#49624d' }}
          >
            Your skin,{' '}
            <br />
            <em className="italic">expertly understood.</em>
          </h2>

          {/* Subheading — new user only */}
          {isNewUser && (
            <p className="text-sm leading-relaxed text-on-surface-variant mb-6 relative">
              {t('home.tagline')}
            </p>
          )}

          {/* CTA */}
          {isNewUser ? (
            <button
              onClick={() => navigate('/check')}
              className="relative px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #49624d, #617b65)' }}
            >
              {t('home.cta_first')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/check')}
              className="relative px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{ border: '1.5px solid #49624d', color: '#49624d', backgroundColor: 'transparent' }}
            >
              {t('home.cta_check')}
            </button>
          )}
        </div>

        {/* ProfileNudge — always directly below hero when visible */}
        <ProfileNudge />

        {/* Returning user: last checked + saves */}
        {!isNewUser && (
          <>
            {/* Last checked card */}
            {loading ? <SkeletonCard tall /> : lastAssessment && (
              <button
                onClick={handleLastAssessmentTap}
                className="w-full text-left rounded-2xl p-4 transition-opacity active:opacity-70"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8' }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: '#737972' }}
                >
                  {t('home.last_checked')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {getDisplayName(lastAssessment.products)}
                    </p>
                    <p className="text-xs mt-0.5 text-on-surface-variant">
                      {lastAssessment.products?.brand
                        ? `${lastAssessment.products.brand} · `
                        : ''}{formatDate(lastAssessment.created_at)}
                    </p>
                  </div>
                  {lastAssessment.safety_verdict && (() => {
                    const s = safetyStyle(lastAssessment.safety_verdict)
                    return (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.bg, color: s.text }}
                      >
                        {safetyLabel(lastAssessment.safety_verdict, t)}
                      </span>
                    )
                  })()}
                </div>
              </button>
            )}

            {/* Saves row — three cards */}
            {loading ? <SkeletonCard /> : (
              <button
                onClick={() => navigate('/saved')}
                className="w-full transition-opacity active:opacity-70"
              >
                <div className="flex gap-3">
                  {[
                    { emoji: '❤️', count: verdictCounts.liked,       label: t('home.loved')      },
                    { emoji: '🔖', count: verdictCounts.want_to_try, label: t('home.wishlist')   },
                    { emoji: '⚠️', count: verdictCounts.avoid,       label: t('home.not_for_me') },
                  ].map(({ emoji, count, label }) => (
                    <div
                      key={label}
                      className="flex-1 flex flex-col items-center gap-1 rounded-xl p-4"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8' }}
                    >
                      <span className="text-xl leading-none">{emoji}</span>
                      <span className="text-lg font-bold text-on-surface leading-tight">{count}</span>
                      <span className="text-[10px] text-on-surface-variant text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </button>
            )}

          </>
        )}

      </main>
    </div>
  )
}
