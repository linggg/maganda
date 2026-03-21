import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

console.log('ENV CHECK:', {
  hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
})

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

  const { productName, brand } = req.body

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' })
  }

  try {
    // Step 1 — check our database first
    const { data: existing } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${productName}%`)
      .limit(5)

    if (existing && existing.length > 0) {
      return res.status(200).json({
        source: 'database',
        products: existing,
      })
    }

    // Step 2 — ask Claude to search the web
    const searchQuery = brand
      ? `${productName} ${brand} ingredients`
      : `${productName} cosmetic ingredients`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Search for the full ingredient list of this cosmetic product: "${searchQuery}".

Look for the ingredients on the brand's official website, Sephora, Olive Young, INCIDecoder, or CosDNA.

Return ONLY a valid JSON object with these exact fields:
{
  "product_name": "exact product name",
  "brand": "brand name",
  "product_type": "e.g. toothpaste, moisturiser, serum",
  "ingredients": "comma separated INCI ingredient list",
  "source_url": "URL where you found the ingredients",
  "confidence": "high, medium, or low"
}

If you cannot find the ingredient list, return:
{
  "confidence": "not_found",
  "ingredients": ""
}

Return only the JSON object. No other text.`
        }
      ]
    })

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock) {
      return res.status(200).json({ source: 'not_found', products: [] })
    }

    // Parse JSON safely
    let parsed
try {
  const raw = textBlock.text
  let cleaned = raw.replace(/```json|```/g, '').trim()
  cleaned = cleaned.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '')
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return res.status(200).json({ source: 'not_found', products: [] })
  parsed = JSON.parse(jsonMatch[0])
} catch (err) {
  console.error('Parse error, raw response:', textBlock.text)
  return res.status(200).json({ source: 'not_found', products: [] })
}

    if (parsed.confidence === 'not_found' || !parsed.ingredients) {
      return res.status(200).json({ source: 'not_found', products: [] })
    }

    // Step 3 — save to Supabase
    const ingredientArray = parsed.ingredients
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)

    const { data: saved, error: saveError } = await supabase
      .from('products')
      .insert([{
        name: parsed.product_name || productName,
        brand: parsed.brand || brand || null,
        product_type: parsed.product_type || null,
        raw_ingredients: parsed.ingredients,
        parsed_ingredients: ingredientArray,
        source: 'claude_web_search',
        source_url: parsed.source_url || null,
        data_reliability: parsed.confidence === 'high' ? 'verified' : 'unverified',
      }])
      .select('*')
      .single()

    if (saveError) throw saveError

    return res.status(200).json({
      source: 'claude_web_search',
      products: [saved],
      confidence: parsed.confidence,
    })

  } catch (err) {
    console.error('Product resolve error:', err)
    return res.status(500).json({ error: 'Failed to resolve product' })
  }
}