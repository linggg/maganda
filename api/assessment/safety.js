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

  function inferCategory(productType) {
    if (!productType) return 'skincare'
    const t = productType.toLowerCase()
    if (/hair|shampoo|conditioner|scalp/.test(t)) return 'haircare'
    if (/nail|polish|lacquer|gel nail|acrylic/.test(t)) return 'nail'
    if (/body|body lotion|body wash|scrub|deodorant/.test(t)) return 'bodycare'
    if (/foundation|mascara|lipstick|eyeshadow|blush|bronzer|concealer|primer|makeup/.test(t)) return 'makeup'
    if (/fragrance|perfume|cologne|eau de/.test(t)) return 'fragrance'
    return 'skincare'
  }

  function buildProfileContext(profile, category) {
    const notes = profile.additional_notes ? `\n- Additional notes: ${profile.additional_notes}` : ''
    switch (category) {
      case 'haircare':
        return `User profile (haircare):
- Scalp type: ${profile.scalp_type || 'not specified'}
- Hair concerns: ${profile.hair_concerns?.join(', ') || 'none'}${notes}`
      case 'bodycare':
        return `User profile (bodycare):
- Body concerns: ${profile.body_concerns?.join(', ') || 'none'}${notes}`
      case 'nail':
        return `User profile (nail):
- Nail concerns: ${profile.nail_concerns?.join(', ') || 'none'}
- Regular gel/acrylic/dip powder use: ${profile.nail_chemical_exposure ? 'yes' : 'no'}${notes}`
      case 'fragrance':
        return `User profile (full):
- Skin type: ${profile.skin_type}
- Skin concerns: ${profile.skin_concerns?.join(', ')}
- Gender identity: ${profile.gender_identity}
- Age range: ${profile.age_range}
- Hormone therapy: ${profile.hormone_therapy || 'none'}
- Pregnancy/breastfeeding: ${profile.pregnancy_status || 'no'}
- Hormonal conditions: ${profile.hormonal_conditions?.join(', ') || 'none'}
- Sun exposure: ${profile.sun_exposure}
- Known reactions: ${profile.known_reactions || 'none'}
- Scalp type: ${profile.scalp_type || 'not specified'}
- Hair concerns: ${profile.hair_concerns?.join(', ') || 'none'}
- Body concerns: ${profile.body_concerns?.join(', ') || 'none'}
- Nail concerns: ${profile.nail_concerns?.join(', ') || 'none'}${notes}`
      default: // skincare, makeup
        return `User profile (${category}):
- Skin type: ${profile.skin_type}
- Skin concerns: ${profile.skin_concerns?.join(', ')}
- Gender identity: ${profile.gender_identity}
- Age range: ${profile.age_range}
- Hormone therapy: ${profile.hormone_therapy || 'none'}
- Pregnancy/breastfeeding: ${profile.pregnancy_status || 'no'}
- Hormonal conditions: ${profile.hormonal_conditions?.join(', ') || 'none'}
- Sun exposure: ${profile.sun_exposure}
- Known reactions: ${profile.known_reactions || 'none'}${notes}`
    }
  }

  const t0 = Date.now()
  console.log('[Safety] Start')

  try {
    let category = 'skincare'

    if (productId) {
      const [{ data: cached }, { data: product }] = await Promise.all([
        supabase
          .from('assessments')
          .select('*')
          .eq('product_id', productId)
          .eq('profile_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('products')
          .select('product_type')
          .eq('id', productId)
          .maybeSingle(),
      ])

      console.log('[Safety] DB reads done:', Date.now() - t0, 'ms')

      if (cached) {
        console.log('[Safety] Cache hit, returning')
        return res.status(200).json({ source: 'cache', assessment: cached })
      }

      console.log('[Safety] Cache miss, calling Claude')
      category = inferCategory(product?.product_type)
    }

    const profileContext = buildProfileContext(userProfile, category)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a cosmetic ingredient safety analyst. Analyse this ${category} product's ingredient list for a specific user.

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

    console.log('[Safety] Claude done:', Date.now() - t0, 'ms')

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

    // Save to Supabase — upsert on unique (product_id, profile_id).
    // user_verdict is intentionally excluded so it is never overwritten.
    const { data: saved } = await supabase
      .from('assessments')
      .upsert(
        [{
          product_id: productId || null,
          profile_id: userProfile.id,
          safety_verdict: assessment.verdict,
          safety_summary: assessment.summary,
          flagged_ingredients: assessment.flagged_ingredients,
          beneficial_ingredients: assessment.beneficial_ingredients,
          unverified_ingredients: assessment.unverified_ingredients,
        }],
        { onConflict: 'product_id,profile_id' }
      )
      .select('*')
      .single()

    console.log('[Safety] Upsert done:', Date.now() - t0, 'ms')

    return res.status(200).json({
      source: 'claude',
      assessment: saved || assessment,
    })

  } catch (err) {
    console.error('Safety assessment error:', err)
    return res.status(500).json({ error: 'Failed to run safety assessment' })
  }
}