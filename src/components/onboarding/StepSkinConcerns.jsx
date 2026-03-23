import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

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
          const descKey = `onboarding.steps.skin_concerns.options.${opt.key}_desc`
          const desc = t(descKey, { defaultValue: '' })
          return (
            <StepOption
              key={opt.key}
              icon={opt.icon}
              label={t(`onboarding.steps.skin_concerns.options.${opt.key}`)}
              description={desc || undefined}
              selected={value.includes(opt.key)}
              onClick={() => toggle(opt.key)}
            />
          )
        })}
      </div>
    </div>
  )
}
