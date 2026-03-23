import { useTranslation } from 'react-i18next'

export default function SafetyVerdict({ verdict, summary }) {
  const { t } = useTranslation()

  const config = {
    safe: {
      label: t('assessment.verdict_safe'),
      icon: 'check_circle',
      bg: '#ceeacf',
      color: '#1a4d2e',
      iconColor: '#49624d',
    },
    caution: {
      label: t('assessment.verdict_caution'),
      icon: 'warning',
      bg: '#fef3c7',
      color: '#92400e',
      iconColor: '#92400e',
    },
    avoid: {
      label: t('assessment.verdict_risk'),
      icon: 'error',
      bg: '#ffdad6',
      color: '#ba1a1a',
      iconColor: '#ba1a1a',
    },
  }

  const v = (verdict || '').toLowerCase()
  const c = config[v] || (v === 'alert' ? config.avoid : config.safe)

  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{ backgroundColor: c.bg }}
    >
      <span
        className="material-symbols-outlined text-3xl flex-shrink-0 mt-0.5"
        style={{ color: c.iconColor, fontVariationSettings: "'FILL' 1" }}
      >
        {c.icon}
      </span>
      <div>
        <p className="font-headline text-xl font-extrabold mb-1" style={{ color: c.color }}>
          {c.label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: c.color }}>
          {summary}
        </p>
      </div>
    </div>
  )
}