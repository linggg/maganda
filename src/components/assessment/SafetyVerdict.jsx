export default function SafetyVerdict({ verdict, summary }) {
  const config = {
    safe: {
      label: 'Safe',
      icon: 'check_circle',
      bg: '#ceeacf',
      color: '#092010',
      iconColor: '#49624d',
    },
    caution: {
      label: 'Caution',
      icon: 'warning',
      bg: '#ffd9de',
      color: '#2e1319',
      iconColor: '#775259',
    },
    alert: {
      label: 'Alert',
      icon: 'error',
      bg: '#ffdad6',
      color: '#93000a',
      iconColor: '#ba1a1a',
    },
  }

  const c = config[verdict] || config.safe

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