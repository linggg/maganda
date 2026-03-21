import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { productName, brand, ingredients, skinConcern } = req.body

  if (!ingredients || !skinConcern) {
    return res.status(400).json({ error: 'Ingredients and skin concern are required' })
  }

  try {
    const searchQuery = productName
      ? `${productName} ${brand || ''} review ${skinConcern}`
      : null

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: searchQuery ? [{ type: 'web_search_20250305', name: 'web_search' }] : [],
      messages: [
        {
          role: 'user',
          content: `You are a cosmetic efficacy analyst. Assess whether this product is likely to be effective for the user's specific concern.

User concern: ${skinConcern}
${searchQuery ? `Product: ${productName} by ${brand || 'unknown brand'}` : 'Unknown product'}

Ingredient list:
${ingredients}

${searchQuery ? `Search for reviews of "${productName} ${brand || ''}" specifically mentioning ${skinConcern} to supplement your ingredient analysis.` : ''}

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
  "review_summary": "2-3 sentences summarising what real users report about this product specifically for ${skinConcern}. If no reviews found, say so honestly.",
  "review_source": "source URL or null",
  "signal_type": "ingredient_based, review_based, or combined"
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

    return res.status(200).json({ efficacy })

  } catch (err) {
    console.error('Efficacy assessment error:', err)
    return res.status(500).json({ error: 'Failed to run efficacy assessment' })
  }
}