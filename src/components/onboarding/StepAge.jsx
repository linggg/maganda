import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const options = ['under_18', '18_25', '26_35', '36_45', '46_plus']

export default function StepAge({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.age.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.age.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => (
          <StepOption
            key={opt}
            label={t(`onboarding.steps.age.options.${opt}`)}
            selected={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  )
}