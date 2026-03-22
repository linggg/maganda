import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function ProfileNudge() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, fetchProfile, user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const version = profile?.profile_version
  const shouldShow =
    !dismissed &&
    profile?.onboarding_complete &&
    (version === 1 || version === 2)

  if (!shouldShow) return null

  const isV1 = version === 1
  const title = isV1 ? t('nudge.title') : t('nudge.title_v2')
  const subtitle = isV1 ? t('nudge.subtitle') : t('nudge.subtitle_v2')
  const cta = isV1 ? t('nudge.cta') : t('nudge.cta_v2')
  const nextVersion = isV1 ? 2 : 3
  const destination = isV1 ? '/profile/notes' : '/profile/extended'

  async function handleDismiss() {
    setDismissed(true)
    await supabase
      .from('profiles')
      .update({ profile_version: nextVersion })
      .eq('id', profile.id)
    await fetchProfile(user.id)
  }

  function handleCta() {
    navigate(destination)
  }

  return (
    <div
      className="mx-6 mb-4 rounded-2xl p-4 flex items-start gap-3"
      style={{ backgroundColor: '#eef3ef', border: '1px solid #c8d8cb' }}
    >
      <span
        className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5"
        style={{ color: '#49624d' }}
      >
        person_add
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        <button
          onClick={handleCta}
          className="mt-3 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#49624d', color: '#ffffff' }}
        >
          {cta}
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all active:opacity-70"
        style={{ color: '#737972' }}
        aria-label={t('nudge.dismiss')}
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}
