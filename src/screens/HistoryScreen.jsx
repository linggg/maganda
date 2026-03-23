import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ANONYMOUS_NAMES = ['Ingredient Check', 'User submitted product', 'Scanned product']

function isAnonymous(product) {
  return !product?.name || ANONYMOUS_NAMES.includes(product.name)
}

function getDisplayName(product) {
  if (!product) return 'Ingredient Check'
  if (isAnonymous(product)) return 'Ingredient Check'
  return product.name
}

function getIngredientSubtitle(product) {
  if (!isAnonymous(product)) return null
  const raw = product?.raw_ingredients || ''
  const first3 = raw.split(',').slice(0, 3).map(s => s.trim()).filter(Boolean).join(', ')
  if (!first3) return null
  return first3.length > 40 ? first3.slice(0, 40) + '…' : first3 + '…'
}

const SAFETY_COLORS = {
  safe: { bg: '#ceeacf', text: '#1a4d2e' },
  caution: { bg: '#fef3c7', text: '#92400e' },
  avoid: { bg: '#ffdad6', text: '#ba1a1a' },
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

const USER_VERDICT_CONFIG = {
  liked:        { emoji: '❤️', bg: '#ceeacf', text: '#1a4d1e' },
  want_to_try:  { emoji: '🔖', bg: '#eceeed', text: '#3c4d3f' },
  avoid:        { emoji: '⚠️', bg: '#ffdad6', text: '#93000a' },
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

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: '#eceeed' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded animate-pulse w-3/4" style={{ backgroundColor: '#eceeed' }} />
        <div className="h-2.5 rounded animate-pulse w-1/2" style={{ backgroundColor: '#eceeed' }} />
      </div>
      <div className="h-5 w-14 rounded-full animate-pulse" style={{ backgroundColor: '#eceeed' }} />
    </div>
  )
}

export default function HistoryScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return }
    supabase
      .from('assessments')
      .select('id, safety_verdict, user_verdict, created_at, products(id, name, brand, raw_ingredients, parsed_ingredients)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data)
        setLoading(false)
      })
  }, [profile?.id])

  const filtered = search.trim()
    ? items.filter(item => {
        const name = getDisplayName(item.products).toLowerCase()
        const brand = (item.products?.brand || '').toLowerCase()
        const q = search.toLowerCase()
        return name.includes(q) || brand.includes(q)
      })
    : items

  function handleTap(item) {
    const product = item.products
    if (!product) return
    navigate(`/assessment/${product.id}`, {
      state: {
        productId: product.id,
        productName: isAnonymous(product) ? 'Ingredient Check' : product.name,
        brand: product.brand,
        ingredients: product.raw_ingredients || '',
        parsed: product.parsed_ingredients || [],
      },
    })
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4"
        style={{ backgroundColor: '#f8faf9', borderBottom: '1px solid #e6e9e8' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: '#eceeed' }}
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-on-surface">{t('history.title')}</h1>
      </div>

      <div className="px-6 pt-4 pb-6 space-y-4">
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e1e3e2' }}
        >
          <span className="material-symbols-outlined text-base" style={{ color: '#737972' }}>search</span>
          <input
            type="text"
            className="flex-1 text-sm bg-transparent outline-none text-on-surface placeholder:text-outline"
            placeholder={t('history.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <span className="material-symbols-outlined text-base" style={{ color: '#737972' }}>close</span>
            </button>
          )}
        </div>

        {loading ? (
          <div
            className="rounded-2xl overflow-hidden divide-y"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8' }}
          >
            {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#737972' }}>
            {search.trim() ? t('history.no_results') : t('history.empty')}
          </p>
        ) : (
          <div
            className="rounded-2xl overflow-hidden divide-y"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8', divideColor: '#e6e9e8' }}
          >
            {filtered.map(item => {
              const product = item.products
              const sStyle = safetyStyle(item.safety_verdict)
              const uConfig = USER_VERDICT_CONFIG[item.user_verdict]
              return (
                <button
                  key={item.id}
                  onClick={() => handleTap(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-70 transition-opacity"
                >
                  <span
                    className="material-symbols-outlined text-base flex-shrink-0"
                    style={{ color: '#49624d' }}
                  >
                    history
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {getDisplayName(product)}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {getIngredientSubtitle(product)
                        ? `${getIngredientSubtitle(product)} · ${formatDate(item.created_at)}`
                        : `${product?.brand ? `${product.brand} · ` : ''}${formatDate(item.created_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {uConfig && (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: uConfig.bg, color: uConfig.text }}
                      >
                        {uConfig.emoji}
                      </span>
                    )}
                    {item.safety_verdict && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: sStyle.bg, color: sStyle.text }}
                      >
                        {safetyLabel(item.safety_verdict, t)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
