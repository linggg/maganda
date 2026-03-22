import { useTranslation } from 'react-i18next'

const NAIL_OPTIONS = [
  { key: 'brittle', icon: 'broken_image' },
  { key: 'fungal_prone', icon: 'coronavirus' },
  { key: 'sensitive_cuticles', icon: 'favorite' },
]

export default function StepNails({ concerns, onConcernsChange, chemicalExposure, onChemicalExposureChange }) {
  const { t } = useTranslation()

  function toggle(key) {
    if (concerns.includes(key)) {
      onConcernsChange(concerns.filter(v => v !== key))
    } else {
      onConcernsChange([...concerns, key])
    }
  }

  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_all')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.nails.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.nails.subtitle')}
      </p>

      <div className="space-y-3 mb-4">
        {NAIL_OPTIONS.map(opt => {
          const selected = concerns.includes(opt.key)
          return (
            <button
              key={opt.key}
              onClick={() => toggle(opt.key)}
              style={selected
                ? { backgroundColor: '#617b65', borderColor: '#617b65' }
                : { backgroundColor: '#ffffff', borderColor: '#e1e3e2' }
              }
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] outline-none"
            >
              <div
                style={selected ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: '#ceeacf' }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <span
                  style={selected ? { color: '#ffffff' } : { color: '#49624d' }}
                  className="material-symbols-outlined text-xl"
                >
                  {opt.icon}
                </span>
              </div>
              <span
                style={selected ? { color: '#ffffff' } : { color: '#191c1c' }}
                className="flex-1 text-left font-semibold"
              >
                {t(`onboarding.steps.nails.options.${opt.key}`)}
              </span>
              <div
                style={selected
                  ? { backgroundColor: '#ffffff', borderColor: '#ffffff' }
                  : { borderColor: '#c3c8c0' }
                }
                className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
              >
                {selected && (
                  <span style={{ color: '#617b65' }} className="material-symbols-outlined text-sm">check</span>
                )}
              </div>
            </button>
          )
        })}

        {/* Chemical exposure toggle */}
        <button
          onClick={() => onChemicalExposureChange(!chemicalExposure)}
          style={chemicalExposure
            ? { backgroundColor: '#617b65', borderColor: '#617b65' }
            : { backgroundColor: '#ffffff', borderColor: '#e1e3e2' }
          }
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] outline-none"
        >
          <div
            style={chemicalExposure ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: '#ceeacf' }}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span
              style={chemicalExposure ? { color: '#ffffff' } : { color: '#49624d' }}
              className="material-symbols-outlined text-xl"
            >
              layers
            </span>
          </div>
          <span
            style={chemicalExposure ? { color: '#ffffff' } : { color: '#191c1c' }}
            className="flex-1 text-left font-semibold"
          >
            {t('onboarding.steps.nails.chemical_exposure_label')}
          </span>
          <div
            style={chemicalExposure
              ? { backgroundColor: '#ffffff', borderColor: '#ffffff' }
              : { borderColor: '#c3c8c0' }
            }
            className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
          >
            {chemicalExposure && (
              <span style={{ color: '#617b65' }} className="material-symbols-outlined text-sm">check</span>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
