import ProductCard from './ProductCard'
import { useTranslation } from 'react-i18next'

export default function SearchResults({ results, onSelect, query }) {
  const { t } = useTranslation()

  if (!query || query.trim().length < 2) return null

  if (results.length === 0) {
    return (
      <div className="py-8 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-3 block">
          search_off
        </span>
        <p className="font-bold text-sm text-on-surface mb-1">
          {t('check.no_results_title')}
        </p>
        <p className="text-xs text-on-surface-variant">
          {t('check.no_results_subtitle')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-on-surface-variant font-medium">
        {results.length} {t('check.results_found')}
      </p>
      {results.map(product => (
        <ProductCard
          key={product.id || product._id}
          product={product}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}