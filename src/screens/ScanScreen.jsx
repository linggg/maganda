import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { parseIngredients } from '../lib/openbeautyfacts'
import TopBar from '../components/TopBar'
import SearchBar from '../components/scan/SearchBar'
import SearchResults from '../components/scan/SearchResults'
import PasteInput from '../components/scan/PasteInput'

const TABS = ['search', 'paste']

export default function ScanScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
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

  async function handlePasteSubmit(text) {
    const parsed = parseIngredients(text)
    const { data: saved } = await supabase
      .from('products')
      .insert([{
        name: 'User submitted product',
        raw_ingredients: text,
        parsed_ingredients: parsed,
        source: 'user_submitted',
        data_reliability: 'unverified',
      }])
      .select('id')
      .single()

    navigate(`/assessment/${saved?.id}`, {
      state: {
        productId: saved?.id,
        productName: 'User submitted product',
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
            {t('scan.input_methods')}
          </span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            {t('scan.title')}
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
                {tab === 'search' ? 'search' : 'content_paste'}
              </span>
              {t(`scan.method_${tab}`)}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} loading={loading} />
            <SearchResults
              results={results}
              onSelect={handleProductSelect}
              query={query}
            />
          </div>
        )}

        {activeTab === 'paste' && (
          <PasteInput onSubmit={handlePasteSubmit} />
        )}
      </main>
    </div>
  )
}