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

  const { productId, profileId, productName, brand, ingredients, skinConcern } = req.body

  if (!ingredients || !skinConcern) {
    return res.status(400).json({ error: 'Ingredients and skin concern are required' })
  }

  const isResolved = !!(productId && productName)
  const canCache = !!(productId && profileId)

  try {
    // Cache check
    if (canCache) {
      const { data } = await supabase
        .from('assessments')
        .select('efficacy_results')
        .eq('product_id', productId)
        .eq('profile_id', profileId)
        .maybeSingle()

      if (data?.efficacy_results?.[skinConcern]) {
        return res.status(200).json({ efficacy: data.efficacy_results[skinConcern], source: 'cache' })
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: isResolved ? [{ type: 'web_search_20250305', name: 'web_search' }] : [],
      messages: [
        {
          role: 'user',
          content: `You are a cosmetic efficacy analyst. Assess whether this product is likely to be effective for the user's specific concern.

User concern: ${skinConcern}
${isResolved ? `Product: ${productName} by ${brand || 'unknown brand'}` : 'Ingredient list only — no product name available'}

Ingredient list:
${ingredients}

${isResolved ? `Search for reviews of "${productName} ${brand || ''}" specifically mentioning ${skinConcern} to supplement your ingredient analysis.` : ''}

Return ONLY a valid JSON object:
{
  "efficacy_verdict": "likely_effective, possibly_effective, or unlikely_effective",
  "efficacy_score": 0-100,
  "verdict_reason": "2-3 sentences explaining WHY this score — reference specific ingredients and how they relate to ${skinConcern}. Be honest if the product is not designed for this concern.",
  "key_actives": [
    {
      "ingredient": "ingredient name",
      "benefit": "what this ingredient does for ${skinConcern} in plain English",
      "relevance": "high, medium, or low"
    }
  ],
  "key_concerns": [
    {
      "ingredient": "ingredient name",
      "concern": "why this ingredient may work against ${skinConcern}",
      "relevance": "high, medium, or low"
    }
  ],
  ${isResolved ? `"review_summary": "2-3 sentences summarising what real users report about this product specifically for ${skinConcern}. If no reviews found, say so honestly.",
  "review_source": "source URL or null",` : `"review_summary": null,
  "review_source": null,`}
  "signal_type": "${isResolved ? 'ingredient_based, review_based, or combined' : 'ingredient_based'}"
}

Rules:
- Be honest — if a product is not designed for the concern, say so clearly
- Never overstate efficacy
- Keep all text under 30 words per field
- Return only the JSON object, no other text`
        }
      ]
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock) throw new Error('No response from Claude')

    let efficacy
try {
  const raw = textBlock.text
  // Remove markdown code blocks
  let cleaned = raw.replace(/```json|```/g, '').trim()
  // Remove citation tags
  cleaned = cleaned.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '')
  // Extract JSON object if wrapped in other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  efficacy = JSON.parse(jsonMatch[0])
} catch (err) {
  console.error('Parse error, raw response:', textBlock.text)
  throw new Error('Failed to parse efficacy assessment')
}

    // Cache write — atomic JSONB merge so concurrent concern writes don't overwrite each other
    if (canCache) {
      await supabase.rpc('merge_efficacy_result', {
        p_product_id: productId,
        p_profile_id: profileId,
        p_concern: skinConcern,
        p_result: efficacy,
      })
    }

    return res.status(200).json({ efficacy })

  } catch (err) {
    console.error('Efficacy assessment error:', err)
    return res.status(500).json({ error: 'Failed to run efficacy assessment' })
  }
}