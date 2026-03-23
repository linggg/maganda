import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

const SCALP_OPTIONS = [
  { key: 'oily', icon: 'water_drop' },
  { key: 'dry', icon: 'wb_sunny' },
  { key: 'normal', icon: 'check_circle' },
  { key: 'sensitive', icon: 'favorite' },
]

const HAIR_OPTIONS = [
  { key: 'dandruff', icon: 'grain' },
  { key: 'thinning_loss', icon: 'arrow_downward' },
  { key: 'frizz', icon: 'air' },
  { key: 'dryness', icon: 'water_drop' },
  { key: 'colour_treated', icon: 'palette' },
  { key: 'chemically_treated', icon: 'science' },
]

export default function StepScalpHair({ scalpType, onScalpTypeChange, hairConcerns, onHairConcernsChange }) {
  const { t } = useTranslation()

  function toggleHair(key) {
    if (hairConcerns.includes(key)) {
      onHairConcernsChange(hairConcerns.filter(v => v !== key))
    } else {
      onHairConcernsChange([...hairConcerns, key])
    }
  }

  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.steps.scalp_hair.title')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.scalp_hair.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.scalp_hair.subtitle')}
      </p>

      {/* Scalp type — single select */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#775259' }}>
        {t('onboarding.steps.scalp_hair.scalp_label')}
      </p>
      <div className="space-y-3 mb-8">
        {SCALP_OPTIONS.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.scalp_hair.scalp_options.${opt.key}`)}
            selected={scalpType === opt.key}
            onClick={() => onScalpTypeChange(scalpType === opt.key ? null : opt.key)}
          />
        ))}
      </div>

      {/* Hair concerns — multi select */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#775259' }}>
        {t('onboarding.steps.scalp_hair.hair_label')}
      </p>
      <div className="space-y-3">
        {HAIR_OPTIONS.map(opt => (
          <StepOption
            key={opt.key}
            icon={opt.icon}
            label={t(`onboarding.steps.scalp_hair.hair_options.${opt.key}`)}
            description={t(`onboarding.steps.scalp_hair.hair_options.${opt.key}_desc`)}
            selected={hairConcerns.includes(opt.key)}
            onClick={() => toggleHair(opt.key)}
          />
        ))}
      </div>
    </div>
  )
}
