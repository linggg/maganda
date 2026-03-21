import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAssessment } from '../hooks/useAssessment'
import SafetyVerdict from '../components/assessment/SafetyVerdict'
import FlaggedIngredient from '../components/assessment/FlaggedIngredient'
import BeneficialIngredient from '../components/assessment/BeneficialIngredient'
import EfficacyCard from '../components/assessment/EfficacyCard'

export default function AssessmentScreen() {
  const { state } = useLocation()
  const navigate = useNavigate()
 
  const { profile } = useAuth()
console.log('Profile:', profile)

  const {
    safety,
    efficacy,
    safetyLoading,
    efficacyLoading,
    error,
  } = useAssessment({
    productId: state?.productId,
    productName: state?.productName,
    brand: state?.brand,
    ingredients: state?.ingredients,
    userProfile: profile,
  })

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
        progress_activity
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-12">
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4"
        style={{ backgroundColor: '#f8faf9', borderBottom: '1px solid #e6e9e8' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: '#eceeed' }}
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline font-bold text-on-surface truncate">
            {state?.productName || 'Product Assessment'}
          </h1>
          {state?.brand && (
            <p className="text-xs text-on-surface-variant">{state.brand}</p>
          )}
        </div>
      </div>

      <div className="px-6 pt-6 space-y-8">
        {error && (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#ffdad6' }}>
            <p className="text-sm font-medium" style={{ color: '#93000a' }}>{error}</p>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">Safety Assessment</h2>
            {safetyLoading && (
              <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
                progress_activity
              </span>
            )}
          </div>

          {safetyLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#eceeed' }} />
              ))}
            </div>
          ) : safety ? (
            <div className="space-y-4">
              <SafetyVerdict
                verdict={safety.safety_verdict || safety.verdict}
                summary={safety.safety_summary || safety.summary}
              />
              {(safety.flagged_ingredients || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                    Flagged for you
                  </p>
                  <div className="space-y-3">
                    {(safety.flagged_ingredients || []).map((flag, i) => (
                      <FlaggedIngredient key={i} {...flag} />
                    ))}
                  </div>
                </div>
              )}
              {(safety.beneficial_ingredients || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                    Works for you
                  </p>
                  <div className="space-y-3">
                    {(safety.beneficial_ingredients || []).map((item, i) => (
                      <BeneficialIngredient key={i} {...item} />
                    ))}
                  </div>
                </div>
              )}
              {(safety.unverified_ingredients || []).length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: '#f2f4f3', border: '1px solid #e1e3e2' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Could not verify
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {(safety.unverified_ingredients || []).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </section>

        <div style={{ borderTop: '1px solid #e6e9e8' }} />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">Does It Work For You?</h2>
            {efficacyLoading && (
              <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
                progress_activity
              </span>
            )}
          </div>

          {efficacyLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: '#eceeed' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(efficacy).map(([concern, data]) => (
                <EfficacyCard key={concern} concern={concern} efficacy={data} />
              ))}
              {Object.keys(efficacy).length === 0 && (
                <p className="text-sm text-on-surface-variant">No efficacy data available.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}