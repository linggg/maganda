import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const options = [
  { key: 'woman', icon: 'person' },
  { key: 'man', icon: 'person' },
  { key: 'non_binary', icon: 'person' },
  { key: 'prefer_not', icon: 'visibility_off' },
]

export default function StepGender({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.gender.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.gender.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.gender.options.${opt.key}`)}
            selected={value === opt.key}
            onClick={() => onChange(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}