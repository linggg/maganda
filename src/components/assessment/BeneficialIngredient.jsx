export default function BeneficialIngredient({ ingredient, benefit, why_for_you }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: '#f2f4f3', borderColor: '#c3c8c0' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5"
          style={{ color: '#49624d', fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <div>
          <p className="font-bold text-sm text-on-surface mb-1">{ingredient}</p>
          <p className="text-xs text-on-surface-variant mb-1">{benefit}</p>
          {why_for_you && (
            <p className="text-xs font-medium" style={{ color: '#49624d' }}>
              For you: {why_for_you}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}