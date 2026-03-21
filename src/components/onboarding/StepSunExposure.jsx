import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const options = [
  { key: 'low', icon: 'night_shelter' },
  { key: 'moderate', icon: 'partly_cloudy_day' },
  { key: 'high', icon: 'wb_sunny' },
]

export default function StepSunExposure({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.sun_exposure.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.sun_exposure.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.sun_exposure.options.${opt.key}`)}
            description={t(`onboarding.steps.sun_exposure.options.${opt.key}_desc`)}
            selected={value === opt.key}
            onClick={() => onChange(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}