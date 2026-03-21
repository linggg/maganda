import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { productId, ingredients, userProfile } = req.body

  if (!ingredients || !userProfile) {
    return res.status(400).json({ error: 'Ingredients and user profile are required' })
  }

  try {
    // Check cache
    if (productId) {
      const { data: cached } = await supabase
        .from('assessments')
        .select('*')
        .eq('product_id', productId)
        .eq('profile_id', userProfile.id)
        .single()

      if (cached) {
        return res.status(200).json({ source: 'cache', assessment: cached })
      }
    }

    const profileContext = `
User profile:
- Skin type: ${userProfile.skin_type}
- Skin concerns: ${userProfile.skin_concerns?.join(', ')}
- Gender identity: ${userProfile.gender_identity}
- Age range: ${userProfile.age_range}
- Hormone therapy: ${userProfile.hormone_therapy || 'none'}
- Pregnancy/breastfeeding: ${userProfile.pregnancy_status || 'no'}
- Hormonal conditions: ${userProfile.hormonal_conditions?.join(', ') || 'none'}
- Sun exposure: ${userProfile.sun_exposure}
- Known reactions: ${userProfile.known_reactions || 'none'}
`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a cosmetic ingredient safety analyst. Analyse this ingredient list for a specific user.

${profileContext}

Ingredient list:
${ingredients}

Return ONLY a valid JSON object:
{
  "verdict": "safe, caution, or alert",
  "summary": "one sentence plain English summary for this user specifically — mention their specific profile attribute",
  "flagged_ingredients": [
    {
      "ingredient": "ingredient name",
      "severity": "low, medium, or high",
      "reason": "plain English reason why this is flagged FOR THIS USER — mention their specific condition or skin type",
      "flag_type": "irritant, endocrine_disruptor, allergen, comedogenic, pregnancy_risk, or other",
      "what_it_means": "one sentence explaining what this could mean for them in practice"
    }
  ],
  "beneficial_ingredients": [
    {
      "ingredient": "ingredient name",
      "benefit": "what this ingredient does in plain English",
      "why_for_you": "why this is specifically good for THIS user's profile — mention their skin type or concern"
    }
  ],
  "unverified_ingredients": ["ingredients not in standard databases"]
}

Rules:
- Only flag ingredients relevant to THIS user's profile
- Only highlight beneficial ingredients genuinely relevant to their concerns
- Never use "causes" — use "linked to", "may", or "has been associated with"
- If nothing flagged, verdict is "safe"
- If 1-2 medium flags, verdict is "caution"
- If any high flag or 3+ medium flags, verdict is "alert"
- Keep all text under 25 words per field
- Return only the JSON object, no other text`
        }
      ]
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock) throw new Error('No response from Claude')

    let assessment
try {
  const raw = textBlock.text
  let cleaned = raw.replace(/```json|```/g, '').trim()
  cleaned = cleaned.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '')
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  assessment = JSON.parse(jsonMatch[0])
} catch (err) {
  console.error('Parse error, raw response:', textBlock.text)
  throw new Error('Failed to parse safety assessment')
}

    // Save to Supabase
    const { data: saved } = await supabase
      .from('assessments')
      .insert([{
        product_id: productId || null,
        profile_id: userProfile.id,
        safety_verdict: assessment.verdict,
        safety_summary: assessment.summary,
        flagged_ingredients: assessment.flagged_ingredients,
        beneficial_ingredients: assessment.beneficial_ingredients,
        unverified_ingredients: assessment.unverified_ingredients,
      }])
      .select('*')
      .single()

    return res.status(200).json({
      source: 'claude',
      assessment: saved || assessment,
    })

  } catch (err) {
    console.error('Safety assessment error:', err)
    return res.status(500).json({ error: 'Failed to run safety assessment' })
  }
}