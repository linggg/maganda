import { useTranslation } from 'react-i18next'

const MAX = 300

export default function StepAdditionalNotes({ value, onChange }) {
  const { t } = useTranslation()
  const remaining = MAX - (value?.length || 0)

  return (
    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-tertiary mb-2 block">
        {t('onboarding.select_one')}
      </span>
      <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
        {t('onboarding.steps.additional_notes.title')}
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        {t('onboarding.steps.additional_notes.subtitle')}
      </p>
      <div className="relative">
        <textarea
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
          rows={5}
          maxLength={MAX}
          placeholder={t('onboarding.steps.additional_notes.placeholder')}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span
          className="absolute bottom-3 right-4 text-xs"
          style={{ color: remaining < 30 ? '#ba1a1a' : '#a0a5a1' }}
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}
