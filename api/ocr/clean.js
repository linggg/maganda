import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { rawText } = req.body

  if (!rawText) {
    return res.status(400).json({ error: 'Raw OCR text is required' })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `The following text was extracted via OCR from a cosmetic product label. Clean it up.

Raw OCR text:
${rawText}

Instructions:
- Correct obvious OCR errors (e.g. "Niacinarnide" → "Niacinamide")
- Standardise to INCI names where possible
- Remove non-ingredient text (directions, warnings, batch numbers, marketing copy)
- Join hyphenated line breaks
- Return as a clean comma-separated ingredient list

Also identify if visible in the text:
- Product name
- Brand name
- Product type

Return ONLY a valid JSON object:
{
  "ingredients": "clean comma separated ingredient list",
  "product_name": "product name or null",
  "brand": "brand name or null",
  "product_type": "product type or null",
  "confidence": "high, medium, or low"
}

Return only the JSON object, no other text.`
        }
      ]
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock) throw new Error('No response from Claude')

    let cleaned
    try {
      const text = textBlock.text.replace(/```json|```/g, '').trim()
      cleaned = JSON.parse(text)
    } catch {
      throw new Error('Failed to parse OCR cleanup response')
    }

    return res.status(200).json({ cleaned })

  } catch (err) {
    console.error('OCR clean error:', err)
    return res.status(500).json({ error: 'Failed to clean OCR text' })
  }
}