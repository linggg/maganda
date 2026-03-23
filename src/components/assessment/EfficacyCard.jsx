const verdictConfig = {
  likely_effective: {
    label: 'Likely Effective',
    color: '#1a4d2e',
    bg: '#ceeacf',
    bar: '#49624d',
  },
  possibly_effective: {
    label: 'Possibly Effective',
    color: '#92400e',
    bg: '#fef3c7',
    bar: '#d97706',
  },
  unlikely_effective: {
    label: 'Unlikely Effective',
    color: '#ba1a1a',
    bg: '#ffdad6',
    bar: '#ba1a1a',
  },
}

const DEFAULT_VERDICT_CONFIG = verdictConfig.possibly_effective

const concernLabels = {
  acne: 'Acne & Blemishes',
  aging: 'Aging & Fine Lines',
  hyperpigmentation: 'Hyperpigmentation',
  redness: 'Redness & Rosacea',
  dryness: 'Dryness',
  sun_protection: 'Sun Protection',
  other: 'Other',
}

export default function EfficacyCard({ concern, efficacy, hasResolvedProduct }) {
  if (!efficacy) return null

  const verdict = efficacy.efficacy_verdict || 'unlikely_effective'
  const c = verdictConfig[verdict] || DEFAULT_VERDICT_CONFIG
  const score = efficacy.efficacy_score || 0
  const verdictReason = efficacy.verdict_reason || ''
  const keyActives = efficacy.key_actives || []
  const reviewSummary = efficacy.review_summary || ''
  const reviewSource = efficacy.review_source || ''
  const concernLabel = concernLabels[concern] || concern

  return (
    <div
      className="rounded-xl p-5 border"
      style={{ backgroundColor: '#ffffff', borderColor: '#e1e3e2' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-sm text-on-surface">
          {concernLabel}
        </p>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: c.bg, color: c.color }}
        >
          {c.label}
        </span>
      </div>

      <div className="mb-4">
        <div
          className="h-1.5 rounded-full overflow-hidden mb-1"
          style={{ backgroundColor: '#e6e9e8' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: c.bar }}
          />
        </div>
        <p className="text-[10px] font-bold text-right" style={{ color: c.color }}>
          {score}/100
        </p>
      </div>

      {verdictReason.length > 0 && (
        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          {verdictReason}
        </p>
      )}

      {keyActives.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Key Actives
          </p>
          <div className="space-y-1">
            {keyActives.map((active, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5"
                  style={{ color: '#49624d' }}
                >
                  science
                </span>
                <div>
                  <span className="text-xs font-semibold text-on-surface">
                    {active.ingredient}
                  </span>
                  <span className="text-xs text-on-surface-variant"> — {active.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasResolvedProduct && reviewSummary.length > 0 && (
        <div
          className="rounded-lg p-3 mt-2"
          style={{ backgroundColor: '#f2f4f3' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            What users say
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {reviewSummary}
          </p>
          {reviewSource.length > 0 && (
            
            <a href={reviewSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-medium mt-1 block"
              style={{ color: '#49624d' }}
            >
              View source
            </a>
          )}
        </div>
      )}
    </div>
  )
}