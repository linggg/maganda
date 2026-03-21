import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const options = [
  { key: 'oily', icon: 'water_drop' },
  { key: 'dry', icon: 'wb_sunny' },
  { key: 'combination', icon: 'routine' },
  { key: 'sensitive', icon: 'favorite' },
  { key: 'normal', icon: 'check_circle' },
]

export default function StepSkinType({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.skin_type.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.skin_type.subtitle')}
      </p>
      <div className="space-y-3">
        {options.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.skin_type.options.${opt.key}`)}
            description={t(`onboarding.steps.skin_type.options.${opt.key}_desc`)}
            selected={value === opt.key}
            onClick={() => onChange(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}