import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const OPTIONS = [
  { key: 'dryness_eczema', icon: 'humidity_low' },
  { key: 'keratosis_pilaris', icon: 'texture' },
  { key: 'hyperpigmentation', icon: 'contrast' },
  { key: 'sensitive_reactive', icon: 'favorite' },
]

export default function StepBodySkin({ value, onChange }) {
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
        {t('onboarding.steps.body_skin.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.body_skin.subtitle')}
      </p>
      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.body_skin.options.${opt.key}`)}
            description={t(`onboarding.steps.body_skin.options.${opt.key}_desc`)}
            selected={value.includes(opt.key)}
            onClick={() => toggle(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}
