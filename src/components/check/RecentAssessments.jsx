import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

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

const VERDICT_COLORS = {
  safe: { bg: '#ceeacf', text: '#1a4d2e' },
  caution: { bg: '#fef3c7', text: '#92400e' },
  avoid: { bg: '#ffdad6', text: '#ba1a1a' },
}

function verdictStyle(verdict) {
  const v = (verdict || '').toLowerCase()
  if (v === 'safe') return VERDICT_COLORS.safe
  if (v === 'caution' || v === 'moderate') return VERDICT_COLORS.caution
  return VERDICT_COLORS.avoid
}

function verdictLabel(verdict, t) {
  const v = (verdict || '').toLowerCase()
  if (v === 'safe') return t('assessment.verdict_safe')
  if (v === 'caution' || v === 'moderate') return t('assessment.verdict_caution')
  return t('assessment.verdict_risk')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-8 h-8 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: '#eceeed' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded animate-pulse w-3/4" style={{ backgroundColor: '#eceeed' }} />
        <div className="h-2.5 rounded animate-pulse w-1/2" style={{ backgroundColor: '#eceeed' }} />
      </div>
      <div className="h-5 w-14 rounded-full animate-pulse" style={{ backgroundColor: '#eceeed' }} />
    </div>
  )
}

export default function RecentAssessments({ profileId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (!profileId) { setLoading(false); return }

    Promise.all([
      supabase
        .from('assessments')
        .select('id, safety_verdict, created_at, products(id, name, brand, raw_ingredients, parsed_ingredients)')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId),
    ]).then(([{ data, error }, { count }]) => {
      if (!error && data) setItems(data)
      if (count != null) setTotalCount(count)
      setLoading(false)
    })
  }, [profileId])

  if (!loading && items.length === 0) return null

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
    <div className="mb-6">
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#775259' }}>
        {t('check.recent_title')}
      </p>
      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8', divideColor: '#e6e9e8' }}
      >
        {loading
          ? [1, 2, 3].map(i => (
              <div key={i} className="px-4">
                <SkeletonRow />
              </div>
            ))
          : items.map(item => {
              const product = item.products
              const style = verdictStyle(item.safety_verdict)
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
                  {item.safety_verdict && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {verdictLabel(item.safety_verdict, t)}
                    </span>
                  )}
                </button>
              )
            })}
        {!loading && totalCount > 5 && (
          <button
            onClick={() => navigate('/history')}
            className="w-full py-3 text-xs font-bold text-center transition-opacity active:opacity-70"
            style={{ color: '#49624d', borderTop: '1px solid #e6e9e8' }}
          >
            {t('check.see_all')}
          </button>
        )}
      </div>
    </div>
  )
}
