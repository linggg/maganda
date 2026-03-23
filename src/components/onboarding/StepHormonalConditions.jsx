import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const OPTIONS_FEMALE = ['none', 'pcos', 'thyroid', 'endometriosis', 'prefer_not']
const OPTIONS_MALE = ['none', 'thyroid', 'prefer_not']
const HAS_DESC = new Set(['pcos', 'thyroid', 'endometriosis'])

export default function StepHormonalConditions({ value, gender, onChange }) {
  const { t } = useTranslation()

  const isMale = gender === 'man'
  const optionKeys = isMale ? OPTIONS_MALE : OPTIONS_FEMALE
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
        {optionKeys.map(key => (
          <StepOption
            key={key}
            label={t(`${translationBase}.${key}`)}
            description={HAS_DESC.has(key) ? t(`${translationBase}.${key}_desc`) : undefined}
            selected={value.includes(key)}
            onClick={() => toggle(key)}
          />
        ))}
      </div>
    </div>
  )
}
