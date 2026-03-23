import Anthropic from '@anthropic-ai/sdk'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageBase64, mimeType } = req.body

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data is required' })
  }

  const resolvedType = VALID_MIME_TYPES.includes(mimeType) ? mimeType : 'image/jpeg'

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: resolvedType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `This is a photo of a cosmetic product or its packaging. Extract as much useful information as possible.

There are two cases:

CASE 1 — The ingredient list is visible in the photo:
- Extract all ingredients and standardise to INCI names where possible
- Remove non-ingredient text (directions, warnings, batch numbers, marketing copy)
- Set "ingredients" to the clean comma-separated list
- Set "confidence" based on how clearly you can read the text

CASE 2 — The ingredient list is NOT visible, but the product itself is identifiable:
- Read the product name and brand from the packaging
- Set "ingredients" to null
- Set "confidence" to "high" if you are confident in the product identity, "low" if not

Always extract product_name, brand, and product_type whenever visible.

Return ONLY a valid JSON object:
{
  "ingredients": "comma separated list, or null if not visible",
  "product_name": "product name or null",
  "brand": "brand name or null",
  "product_type": "product type or null",
  "confidence": "high, medium, or low"
}

Return only the JSON object, no other text.`,
            },
          ],
        },
      ],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock) throw new Error('No response from Claude')

    let cleaned
    try {
      const text = textBlock.text.replace(/```json|```/g, '').trim()
      cleaned = JSON.parse(text)
    } catch {
      throw new Error('Failed to parse response')
    }

    return res.status(200).json({ cleaned })

  } catch (err) {
    console.error('OCR extract error:', err)
    return res.status(500).json({ error: 'Failed to extract ingredients from image' })
  }
}
