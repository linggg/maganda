export default function ProductCard({ product, onSelect }) {
  const name = product.product_name || product.name || 'Unknown Product'
  const brand = product.brands || product.brand || ''
  const hasIngredients = !!(product.ingredients_text || product.raw_ingredients)
  const imageUrl = product.image_url || product.image_small_url

  return (
    <button
      onClick={() => onSelect(product)}
      className="w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98] text-left"
      style={{ backgroundColor: '#ffffff', border: '2px solid #e1e3e2' }}
    >
      {/* Product image or placeholder */}
      <div
        className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#f2f4f3' }}
      >
        {imageUrl
          ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="material-symbols-outlined text-outline">labs</span>
        }
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-on-surface truncate">{name}</p>
        {brand && (
          <p className="text-xs text-on-surface-variant mt-0.5">{brand}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          {hasIngredients
            ? (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#ceeacf', color: '#092010' }}
              >
                Ingredients available
              </span>
            )
            : (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#ffd9de', color: '#2e1319' }}
              >
                No ingredients
              </span>
            )
          }
        </div>
      </div>

      <span className="material-symbols-outlined text-outline flex-shrink-0">chevron_right</span>
    </button>
  )
}