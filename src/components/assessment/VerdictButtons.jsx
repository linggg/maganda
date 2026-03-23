import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

const VERDICTS = [
  { key: 'liked', emoji: '❤️' },
  { key: 'want_to_try', emoji: '🔖' },
  { key: 'avoid', emoji: '⚠️' },
]

export default function VerdictButtons({ assessmentId, initialVerdict }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(initialVerdict || null)
  const [saving, setSaving] = useState(false)

  async function handleSelect(key) {
    const next = selected === key ? null : key
    setSelected(next) // optimistic
    setSaving(true)
    try {
      await supabase
        .from('assessments')
        .update({ user_verdict: next })
        .eq('id', assessmentId)
    } catch {
      setSelected(selected) // revert on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: '#617b6542' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
        {t('assessment.verdict_title')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {VERDICTS.map(({ key, emoji }) => {
          const isActive = selected === key
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={
                isActive
                  ? { backgroundColor: '#617b65', color: '#ffffff' }
                  : { backgroundColor: '#ffffff', color: '#3c4d3f' }
              }
            >
              <span>{emoji}</span>
              <span>{t(`assessment.verdict_${key}`)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
