import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import SavedCard from '../components/saved/SavedCard'

const FILTERS = ['liked', 'want_to_try', 'avoid']
const ANONYMOUS_NAMES = ['Ingredient Check', 'User submitted product', 'Scanned product']

export default function SavedScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [activeFilter, setActiveFilter] = useState('liked')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    setLoading(true)
    setItems([])
    supabase
      .from('assessments')
      .select('id, safety_verdict, user_verdict, created_at, products(id, name, brand, raw_ingredients, parsed_ingredients)')
      .eq('profile_id', profile.id)
      .eq('user_verdict', activeFilter)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data)
        setLoading(false)
      })
  }, [profile?.id, activeFilter])

  function handleCardTap(item) {
    const product = item.products
    if (!product) return
    navigate(`/assessment/${product.id}`, {
      state: {
        productId: product.id,
        productName: ANONYMOUS_NAMES.includes(product.name) ? 'Ingredient Check' : product.name,
        brand: product.brand,
        ingredients: product.raw_ingredients || '',
        parsed: product.parsed_ingredients || [],
      },
    })
  }

  const emptyKey = `saved.empty_${activeFilter}`

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-24 pb-32 px-6">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-6">
          {t('saved.title')}
        </h2>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                activeFilter === f
                  ? { backgroundColor: '#49624d', color: '#ffffff' }
                  : { backgroundColor: '#eceeed', color: '#3c4d3f' }
              }
            >
              {t(`saved.filter_${f}`)}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ backgroundColor: '#eceeed' }}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map(item => (
              <SavedCard key={item.id} item={item} onClick={() => handleCardTap(item)} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <span
              className="material-symbols-outlined text-5xl mb-4"
              style={{ color: '#c3c8c4' }}
            >
              bookmark
            </span>
            <p className="text-base font-semibold text-on-surface mb-1">
              {t(emptyKey)}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t('saved.empty_sub')}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
