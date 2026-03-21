import { useTranslation } from 'react-i18next'

export default function StepHormonalConditions({ value, gender, onChange }) {
  const { t } = useTranslation()

  const isMale = gender === 'man'
  const optionKeys = isMale
    ? ['none', 'thyroid', 'prefer_not']
    : ['none', 'pcos', 'thyroid', 'endometriosis', 'prefer_not']

  const translationBase = isMale
    ? 'onboarding.steps.hormonal_conditions.options_male'
    : 'onboarding.steps.hormonal_conditions.options'

  function toggle(key) {
    if (key === 'none' || key === 'prefer_not') {
      onChange([key])
      return
    }
    const without = value.filter(v => v !== 'none' && v !== 'prefer_not')
    if (without.includes(key)) {
      const next = without.filter(v => v !== key)
      onChange(next.length === 0 ? [] : next)
    } else {
      onChange([...without, key])
    }
  }

  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_all')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.hormonal_conditions.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.hormonal_conditions.subtitle')}
      </p>
      <div className="space-y-3">
        {optionKeys.map(key => {
          const selected = value.includes(key)
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              style={selected ? { backgroundColor: '#617b65', borderColor: '#617b65' } : {}}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
                selected
                  ? 'shadow-md'
                  : 'bg-white border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  style={selected ? { color: '#ffffff' } : {}}
                  className={`font-bold text-sm ${selected ? '' : 'text-on-surface'}`}
                >
                  {t(`${translationBase}.${key}`)}
                </span>
                <div
                  style={selected ? { backgroundColor: '#ffffff', borderColor: '#ffffff' } : {}}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selected ? '' : 'border-outline-variant'
                  }`}
                >
                  {selected && (
                    <span style={{ color: '#617b65' }} className="material-symbols-outlined text-sm">
                      check
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}