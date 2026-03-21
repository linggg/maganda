import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const options = ['no', 'estrogen', 'testosterone', 'other', 'prefer_not']

export default function StepHormoneTherapy({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.hormone_therapy.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.hormone_therapy.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => (
          <StepOption
            key={opt}
            label={t(`onboarding.steps.hormone_therapy.options.${opt}`)}
            selected={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  )
}