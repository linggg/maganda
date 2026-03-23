import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { parseIngredients } from '../lib/openbeautyfacts'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import SearchBar from '../components/scan/SearchBar'
import SearchResults from '../components/scan/SearchResults'
import PasteInput from '../components/scan/PasteInput'
import PhotoInput from '../components/scan/PhotoInput'
import RecentAssessments from '../components/check/RecentAssessments'

const TABS = ['search', 'photo', 'paste']

const TAB_ICON = {
  search: 'search',
  photo: 'photo_camera',
  paste: 'content_paste',
}

export default function CheckScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [searchInitialValue, setSearchInitialValue] = useState('')
  const [searchKey, setSearchKey] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const searchTimeout = useRef(null)
  const latestQuery = useRef('')

  const handleSearch = useCallback((val) => {
    setQuery(val)
    latestQuery.current = val
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!val || val.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/product/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName: val }),
        })
        const data = await res.json()
        if (val === latestQuery.current) {
          setResults(data.products || [])
        }
      } catch (err) {
        console.error('Search error:', err)
        if (val === latestQuery.current) setResults([])
      } finally {
        if (val === latestQuery.current) setLoading(false)
      }
    }, 800)
  }, [])

  function handleProductSelect(product) {
    const ingredients = product.raw_ingredients || ''
    const parsed = product.parsed_ingredients || []
    navigate(`/assessment/${product.id}`, {
      state: {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        ingredients,
        parsed,
        imageUrl: product.image_url,
      }
    })
  }

  function handleOCRProductFound(productName, brand) {
    const q = [productName, brand].filter(Boolean).join(' ')
    setSearchInitialValue(q)
    setSearchKey(k => k + 1)
    setActiveTab('search')
    handleSearch(q)
  }

  async function handleOCRProductFoundDirect(productName, brand) {
    const q = [productName, brand].filter(Boolean).join(' ')
    try {
      const res = await fetch('/api/product/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: q }),
      })
      const data = await res.json()
      const product = data.products?.[0]
      if (product) {
        handleProductSelect(product)
        return
      }
    } catch {
      // fall through to search
    }
    setSearchInitialValue(q)
    setSearchKey(k => k + 1)
    setActiveTab('search')
    handleSearch(q)
  }

  function handleOCRConfirm(text, productName, brand) {
    const parsed = parseIngredients(text)
    const productId = crypto.randomUUID()
    setSubmitting(true)
    supabase
      .from('products')
      .insert([{
        id: productId,
        name: productName || 'Scanned product',
        brand: brand || null,
        raw_ingredients: text,
        parsed_ingredients: parsed,
        source: 'user_submitted',
        data_reliability: 'unverified',
      }])
      .then(() => {})
      .catch(err => console.error('Background product insert failed:', err))
    navigate(`/assessment/${productId}`, {
      state: {
        productId,
        productName: productName || 'Scanned product',
        brand: brand || null,
        ingredients: text,
        parsed,
      }
    })
  }

  function handlePasteSubmit(text) {
    const parsed = parseIngredients(text)
    const productId = crypto.randomUUID()
    setSubmitting(true)
    supabase
      .from('products')
      .insert([{
        id: productId,
        name: 'Ingredient Check',
        raw_ingredients: text,
        parsed_ingredients: parsed,
        source: 'user_submitted',
        data_reliability: 'unverified',
      }])
      .then(() => {})
      .catch(err => console.error('Background product insert failed:', err))
    navigate(`/assessment/${productId}`, {
      state: {
        productId,
        productName: 'Ingredient Check',
        ingredients: text,
        parsed,
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-24 pb-32 px-6">
        <div className="mb-6">
          <span
            className="text-xs font-bold tracking-widest uppercase mb-2 block"
            style={{ color: '#775259' }}
          >
            {t('check.input_methods')}
          </span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            {t('check.title')}
          </h2>
        </div>

        <div
          className="flex gap-2 mb-6 p-1 rounded-xl"
          style={{ backgroundColor: '#eceeed' }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={
                activeTab === tab
                  ? { backgroundColor: '#ffffff', color: '#49624d' }
                  : { color: '#737972' }
              }
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all"
            >
              <span className="material-symbols-outlined text-base">
                {TAB_ICON[tab]}
              </span>
              {t(`check.method_${tab}`)}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar key={searchKey} initialValue={searchInitialValue} onSearch={handleSearch} loading={loading} />
            {!query && profile?.id && (
              <RecentAssessments profileId={profile.id} />
            )}
            <SearchResults
              results={results}
              onSelect={handleProductSelect}
              query={query}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'photo' && (
          <PhotoInput
            onConfirm={handleOCRConfirm}
            onProductFound={handleOCRProductFoundDirect}
            onSwitchToPaste={() => setActiveTab('paste')}
            submitting={submitting}
          />
        )}

        {activeTab === 'paste' && (
          <PasteInput onSubmit={handlePasteSubmit} submitting={submitting} />
        )}
      </main>
    </div>
  )
}
