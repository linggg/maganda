import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StepSkinType from '../components/onboarding/StepSkinType'
import StepSkinConcerns from '../components/onboarding/StepSkinConcerns'
import StepKnownReactions from '../components/onboarding/StepKnownReactions'

export default function StandaloneFaceScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, fetchProfile, user } = useAuth()

  const [skinType, setSkinType] = useState(profile?.skin_type || null)
  const [skinConcerns, setSkinConcerns] = useState(profile?.skin_concerns || [])
  const [reactions, setReactions] = useState(
    profile?.known_reactions ? 'yes' : (profile?.known_reactions === null && profile?.onboarding_complete ? 'no' : null)
  )
  const [reactionsDetail, setReactionsDetail] = useState(profile?.known_reactions || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        skin_type: skinType,
        skin_concerns: skinConcerns,
        known_reactions: reactions === 'yes' ? reactionsDetail.trim() || null : null,
      })
      .eq('id', profile.id)
    await fetchProfile(user.id)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-headline text-primary text-2xl font-bold">Lingda</h1>
      </div>

      <div className="flex-1 px-6 pt-4 pb-48 overflow-y-auto space-y-12">
        <StepSkinType value={skinType} onChange={setSkinType} />
        <div style={{ borderTop: '1px solid #e6e9e8' }} />
        <StepSkinConcerns value={skinConcerns} onChange={setSkinConcerns} />
        <div style={{ borderTop: '1px solid #e6e9e8' }} />
        <StepKnownReactions
          value={reactions}
          detail={reactionsDetail}
          onChange={setReactions}
          onDetailChange={setReactionsDetail}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 bg-background/90 backdrop-blur-xl z-50">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={saving}
            style={{ color: '#49624d' }}
            className="px-6 py-4 rounded-xl border border-outline-variant/40 text-sm font-medium transition-all active:scale-95 bg-transparent"
          >
            {t('onboarding.back')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: '#49624d', color: '#ffffff' }}
            className="flex-1 py-4 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? '...' : t('onboarding.finish')}
          </button>
        </div>
      </div>
    </div>
  )
}
