import { useState, useEffect } from 'react'

function stripCitations(text) {
  if (!text) return text
  return text
    .replace(/<cite[^>]*>/g, '')
    .replace(/<\/cite>/g, '')
    .trim()
}

export function useAssessment({ productId, productName, brand, ingredients, userProfile }) {
  const [safety, setSafety] = useState(null)
  const [efficacy, setEfficacy] = useState({})
  const [safetyLoading, setSafetyLoading] = useState(true)
  const [efficacyLoading, setEfficacyLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ingredients || !userProfile) return
    runAssessment()
  }, [ingredients, userProfile])

  async function runAssessment() {
    setSafetyLoading(true)
    setEfficacyLoading(true)
    setError(null)

    await Promise.all([
      runSafety(),
      runEfficacyForAllConcerns(),
    ])
  }

  async function runSafety() {
    try {
      const res = await fetch('/api/assessment/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ingredients, userProfile }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSafety(data.assessment)
    } catch (err) {
      setError('Failed to run safety assessment')
      console.error(err)
    } finally {
      setSafetyLoading(false)
    }
  }

  async function runEfficacyForAllConcerns() {
    const concerns = userProfile.skin_concerns || []
    if (concerns.length === 0) {
      setEfficacyLoading(false)
      return
    }

    try {
      const results = await Promise.all(
        concerns.map(async (concern) => {
          const res = await fetch('/api/assessment/efficacy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productName,
              brand,
              ingredients,
              skinConcern: concern,
            }),
          })
          const data = await res.json()

          if (data.efficacy) {
            const e = data.efficacy
            data.efficacy = {
              ...e,
              verdict_reason: stripCitations(e.verdict_reason),
              review_summary: stripCitations(e.review_summary),
              key_actives: (e.key_actives || []).map(a => ({
                ...a,
                benefit: stripCitations(a.benefit),
              })),
              key_concerns: (e.key_concerns || []).map(c => ({
                ...c,
                concern: stripCitations(c.concern),
              })),
            }
          }

          return { concern, efficacy: data.efficacy }
        })
      )

      const efficacyMap = {}
      results.forEach(({ concern, efficacy }) => {
        efficacyMap[concern] = efficacy
      })
      setEfficacy(efficacyMap)
    } catch (err) {
      setError('Failed to run efficacy assessment')
      console.error(err)
    } finally {
      setEfficacyLoading(false)
    }
  }

  return { safety, efficacy, safetyLoading, efficacyLoading, error }
}