import { useTranslation } from 'react-i18next'
import StepOption from './StepOption'

export default function StepKnownReactions({ value, detail, onChange, onDetailChange }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.known_reactions.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.known_reactions.subtitle')}
      </p>
      <div className="space-y-3 mb-6">
        <StepOption
          icon="check"
          label={t('onboarding.steps.known_reactions.yes')}
          selected={value === 'yes'}
          onClick={() => onChange('yes')}
        />
        <StepOption
          icon="close"
          label={t('onboarding.steps.known_reactions.no')}
          selected={value === 'no'}
          onClick={() => onChange('no')}
        />
      </div>
      {value === 'yes' && (
        <textarea
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
          rows={4}
          placeholder={t('onboarding.steps.known_reactions.placeholder')}
          value={detail}
          onChange={e => onDetailChange(e.target.value)}
        />
      )}
    </div>
  )
}