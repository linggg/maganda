import { useTranslation } from 'react-i18next'

const options = [
  { key: 'acne', icon: 'dermatology' },
  { key: 'aging', icon: 'elderly' },
  { key: 'hyperpigmentation', icon: 'contrast' },
  { key: 'redness', icon: 'local_fire_department' },
  { key: 'dryness', icon: 'water_drop' },
  { key: 'sun_protection', icon: 'wb_sunny' },
  { key: 'other', icon: 'more_horiz' },
]

export default function StepSkinConcerns({ value, onChange }) {
  const { t } = useTranslation()

  function toggle(key) {
    if (value.includes(key)) {
      onChange(value.filter(v => v !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_all')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.skin_concerns.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.skin_concerns.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => {
          const selected = value.includes(opt.key)
          return (
            <button
              key={opt.key}
              onClick={() => toggle(opt.key)}
              style={selected
                ? { backgroundColor: '#617b65', borderColor: '#617b65' }
                : { backgroundColor: '#ffffff', borderColor: '#e1e3e2' }
              }
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
                {t(`onboarding.steps.skin_concerns.options.${opt.key}`)}
              </span>
              <div
                style={selected
                  ? { backgroundColor: '#ffffff', borderColor: '#ffffff' }
                  : { borderColor: '#c3c8c0' }
                }
                className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
              >
                {selected && (
                  <span style={{ color: '#617b65' }} className="material-symbols-outlined text-sm">
                    check
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}