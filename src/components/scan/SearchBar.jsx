import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function SearchBar({ onSearch, loading, initialValue = '' }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(initialValue)
  const inputRef = useRef(null)

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length >= 2) {
      onSearch(val)
    }
  }

  function handleClear() {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {loading
          ? <span className="material-symbols-outlined text-outline animate-spin text-xl">progress_activity</span>
          : <span className="material-symbols-outlined text-outline text-xl">search</span>
        }
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={t('check.search_placeholder')}
        className="w-full rounded-xl py-4 pl-12 pr-12 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 transition-all"
        style={{ backgroundColor: '#ffffff', border: '2px solid #e1e3e2' }}
      />
      {query.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center"
        >
          <span className="material-symbols-outlined text-outline text-xl">close</span>
        </button>
      )}
    </div>
  )
}