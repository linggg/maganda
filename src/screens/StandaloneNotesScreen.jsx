import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StepAdditionalNotes from '../components/onboarding/StepAdditionalNotes'

export default function StandaloneNotesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, fetchProfile, user } = useAuth()

  const [notes, setNotes] = useState(profile?.additional_notes || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ additional_notes: notes.trim() || null, profile_version: 2 })
      .eq('id', profile.id)
    await fetchProfile(user.id)
    navigate(-1)
  }

  async function handleSkip() {
    await supabase
      .from('profiles')
      .update({ profile_version: 2 })
      .eq('id', profile.id)
    await fetchProfile(user.id)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-headline text-primary text-2xl font-bold">Maganda</h1>
      </div>

      <div className="flex-1 px-6 pt-4 pb-48 overflow-y-auto">
        <StepAdditionalNotes value={notes} onChange={setNotes} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 bg-background/90 backdrop-blur-xl z-50">
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
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
