import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

import StepSkinType from '../components/onboarding/StepSkinType'
import StepSkinConcerns from '../components/onboarding/StepSkinConcerns'
import StepKnownReactions from '../components/onboarding/StepKnownReactions'
import StepGender from '../components/onboarding/StepGender'
import StepAge from '../components/onboarding/StepAge'
import StepHormoneTherapy from '../components/onboarding/StepHormoneTherapy'
import StepPregnancy from '../components/onboarding/StepPregnancy'
import StepHormonalConditions from '../components/onboarding/StepHormonalConditions'
import StepSunExposure from '../components/onboarding/StepSunExposure'
import StepAdditionalNotes from '../components/onboarding/StepAdditionalNotes'
import StepScalpHair from '../components/onboarding/StepScalpHair'
import StepBodySkin from '../components/onboarding/StepBodySkin'
import StepNails from '../components/onboarding/StepNails'

const STEPS = [
  'skin_type',
  'skin_concerns',
  'known_reactions',
  'gender',
  'age',
  'hormone_therapy',
  'pregnancy',
  'hormonal_conditions',
  'sun_exposure',
  'additional_notes',
  'scalp_hair',
  'body_skin',
  'nails',
]

function shouldSkipStep(step, answers) {
  const isUnder18 = answers.age === 'under_18'
  const isMale = answers.gender === 'man'
  const isHormonalStep = ['hormone_therapy', 'pregnancy', 'hormonal_conditions'].includes(step)
  if (isUnder18 && isHormonalStep) return true
  if (isMale && ['hormone_therapy', 'pregnancy'].includes(step)) return true
  return false
}

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({
    skin_type: null,
    skin_concerns: [],
    known_reactions: null,
    known_reactions_detail: '',
    gender: null,
    age: null,
    hormone_therapy: null,
    pregnancy: null,
    hormonal_conditions: [],
    sun_exposure: null,
    additional_notes: '',
    scalp_type: null,
    hair_concerns: [],
    body_concerns: [],
    nail_concerns: [],
    nail_chemical_exposure: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const visibleSteps = STEPS.filter(step => !shouldSkipStep(step, answers))
  const currentStep = visibleSteps[stepIndex]
  const totalSteps = visibleSteps.length
  const progress = ((stepIndex + 1) / totalSteps) * 100

  function handleAnswer(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function handleNext() {
    if (stepIndex < visibleSteps.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      handleFinish()
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  async function handleFinish() {
  setSaving(true)
  setError(null)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        skin_type: answers.skin_type,
        skin_concerns: answers.skin_concerns,
        known_reactions: answers.known_reactions === 'yes' ? answers.known_reactions_detail : null,
        gender_identity: answers.gender,
        age_range: answers.age,
        hormone_therapy: answers.hormone_therapy,
        pregnancy_status: answers.pregnancy,
        hormonal_conditions: answers.hormonal_conditions,
        sun_exposure: answers.sun_exposure,
        additional_notes: answers.additional_notes.trim() || null,
        scalp_type: answers.scalp_type,
        hair_concerns: answers.hair_concerns,
        body_concerns: answers.body_concerns,
        nail_concerns: answers.nail_concerns,
        nail_chemical_exposure: answers.nail_chemical_exposure || null,
        onboarding_complete: true,
        profile_version: 3,
      }, { onConflict: 'user_id' })
    if (dbError) throw dbError
    navigate('/home')
  } catch (err) {
    setError('Something went wrong. Please try again.')
    setSaving(false)
  }
}

  const isLastStep = stepIndex === visibleSteps.length - 1

  function canProceed() {
    switch (currentStep) {
      case 'skin_type': return !!answers.skin_type
      case 'skin_concerns': return true
      case 'known_reactions': return !!answers.known_reactions
      case 'gender': return !!answers.gender
      case 'age': return !!answers.age
      case 'hormone_therapy': return !!answers.hormone_therapy
      case 'pregnancy': return !!answers.pregnancy
      case 'hormonal_conditions': return true
      case 'sun_exposure': return !!answers.sun_exposure
      case 'additional_notes': return true
      case 'scalp_hair': return true
      case 'body_skin': return true
      case 'nails': return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Language Selector */}
      <div className="flex justify-end px-6 pt-4">
        <select
          className="text-xs text-outline bg-transparent border border-outline-variant rounded-full px-3 py-1 focus:outline-none"
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="ms">Bahasa Melayu</option>
          <option value="th">ภาษาไทย</option>
          <option value="ko">한국어</option>
          <option value="fil">Filipino</option>
          <option value="zh">中文</option>
        </select>
      </div>

      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        <h1 className="font-headline text-primary text-2xl font-bold mb-4">Maganda</h1>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: '#e6e9e8' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: '#49624d' }}
            />
          </div>
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: '#737972' }}
          >
            {t('onboarding.step_of', { current: stepIndex + 1, total: totalSteps })}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 pt-4 pb-48 overflow-y-auto">
        <div key={currentStep} className="animate-fadeIn">
          {currentStep === 'skin_type' && (
            <StepSkinType value={answers.skin_type} onChange={v => handleAnswer('skin_type', v)} />
          )}
          {currentStep === 'skin_concerns' && (
            <StepSkinConcerns value={answers.skin_concerns} onChange={v => handleAnswer('skin_concerns', v)} />
          )}
          {currentStep === 'known_reactions' && (
            <StepKnownReactions
              value={answers.known_reactions}
              detail={answers.known_reactions_detail}
              onChange={v => handleAnswer('known_reactions', v)}
              onDetailChange={v => handleAnswer('known_reactions_detail', v)}
            />
          )}
          {currentStep === 'gender' && (
            <StepGender value={answers.gender} onChange={v => handleAnswer('gender', v)} />
          )}
          {currentStep === 'age' && (
            <StepAge value={answers.age} onChange={v => handleAnswer('age', v)} />
          )}
          {currentStep === 'hormone_therapy' && (
            <StepHormoneTherapy value={answers.hormone_therapy} onChange={v => handleAnswer('hormone_therapy', v)} />
          )}
          {currentStep === 'pregnancy' && (
            <StepPregnancy value={answers.pregnancy} onChange={v => handleAnswer('pregnancy', v)} />
          )}
          {currentStep === 'hormonal_conditions' && (
            <StepHormonalConditions
              value={answers.hormonal_conditions}
              gender={answers.gender}
              onChange={v => handleAnswer('hormonal_conditions', v)}
            />
          )}
          {currentStep === 'sun_exposure' && (
            <StepSunExposure value={answers.sun_exposure} onChange={v => handleAnswer('sun_exposure', v)} />
          )}
          {currentStep === 'additional_notes' && (
            <StepAdditionalNotes value={answers.additional_notes} onChange={v => handleAnswer('additional_notes', v)} />
          )}
          {currentStep === 'scalp_hair' && (
            <StepScalpHair
              scalpType={answers.scalp_type}
              onScalpTypeChange={v => handleAnswer('scalp_type', v)}
              hairConcerns={answers.hair_concerns}
              onHairConcernsChange={v => handleAnswer('hair_concerns', v)}
            />
          )}
          {currentStep === 'body_skin' && (
            <StepBodySkin value={answers.body_concerns} onChange={v => handleAnswer('body_concerns', v)} />
          )}
          {currentStep === 'nails' && (
            <StepNails
              concerns={answers.nail_concerns}
              onConcernsChange={v => handleAnswer('nail_concerns', v)}
              chemicalExposure={answers.nail_chemical_exposure}
              onChemicalExposureChange={v => handleAnswer('nail_chemical_exposure', v)}
            />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pb-2">
          <p className="text-sm text-center" style={{ color: '#ba1a1a' }}>{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 bg-background/90 backdrop-blur-xl z-50">
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              style={{ color: '#49624d' }}
              className="px-6 py-4 rounded-xl border border-outline-variant/40 text-sm font-medium transition-all active:scale-95 bg-transparent"
            >
              {t('onboarding.back')}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            style={canProceed() ? { backgroundColor: '#49624d', color: '#ffffff' } : {}}
            className="flex-1 py-4 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-surface-container-high text-on-surface-variant"
          >
            {saving ? '...' : isLastStep ? t('onboarding.finish') : t('onboarding.next')}
          </button>
        </div>
      </div>

    </div>
  )
}