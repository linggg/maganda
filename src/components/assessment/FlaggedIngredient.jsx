const severityConfig = {
  high: { bg: '#ffdad6', border: '#ba1a1a', color: '#93000a', dot: '#ba1a1a' },
  medium: { bg: '#ffd9de', border: '#775259', color: '#2e1319', dot: '#775259' },
  low: { bg: '#f2f4f3', border: '#c3c8c0', color: '#434842', dot: '#737972' },
}

export default function FlaggedIngredient({ ingredient, severity, reason, what_it_means, flag_type }) {
  const c = severityConfig[severity] || severityConfig.low

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: c.dot }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-sm" style={{ color: c.color }}>
              {ingredient}
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: c.dot, color: '#ffffff' }}
            >
              {severity}
            </span>
          </div>
          <p className="text-xs mb-2" style={{ color: c.color }}>
            {reason}
          </p>
          {what_it_means && (
            <div
              className="rounded-lg p-2.5 mt-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
            >
              <p className="text-xs font-medium" style={{ color: c.color }}>
                💡 {what_it_means}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}