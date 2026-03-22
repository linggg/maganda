const VERDICT_COLORS = {
  safe: { bg: '#ceeacf', text: '#1a4d1e' },
  caution: { bg: '#ffd9de', text: '#93000a' },
  avoid: { bg: '#ffdad6', text: '#93000a' },
}

function verdictStyle(verdict) {
  const v = (verdict || '').toLowerCase()
  if (v === 'safe') return VERDICT_COLORS.safe
  if (v === 'caution' || v === 'moderate') return VERDICT_COLORS.caution
  return VERDICT_COLORS.avoid
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SavedCard({ item, onClick }) {
  const product = item.products
  const style = verdictStyle(item.safety_verdict)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left active:opacity-70 transition-opacity"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e6e9e8' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#eceeed' }}
      >
        <span className="material-symbols-outlined text-base" style={{ color: '#49624d' }}>
          science
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">
          {product?.name || 'Unknown product'}
        </p>
        {product?.brand && (
          <p className="text-xs text-on-surface-variant truncate">{product.brand}</p>
        )}
        <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(item.created_at)}</p>
      </div>
      {item.safety_verdict && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 capitalize"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {item.safety_verdict}
        </span>
      )}
    </button>
  )
}
