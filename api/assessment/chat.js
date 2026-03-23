import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { assessmentId, message, accessToken } = req.body

  if (!assessmentId || !message || !accessToken) {
    return res.status(400).json({ error: 'assessmentId, message, and accessToken are required' })
  }

  // Verify user
  const { data: { user }, error: authError } = await adminClient.auth.getUser(accessToken)
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch profile for ownership check and physiology context
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return res.status(403).json({ error: 'Profile not found' })
  }

  // Fetch assessment with product data
  const { data: assessment } = await adminClient
    .from('assessments')
    .select('*, products(name, brand, raw_ingredients)')
    .eq('id', assessmentId)
    .maybeSingle()

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' })
  }

  // Ownership check
  if (assessment.profile_id !== profile.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Limit check
  const history = assessment.chat_history || []
  if (history.length >= 10) {
    return res.status(400).json({ error: 'Chat limit reached for this assessment' })
  }

  // Build safety context
  const flagged = (assessment.flagged_ingredients || [])
    .map(f => `  - ${f.ingredient} (${f.severity}): ${f.reason}`)
    .join('\n')

  const beneficial = (assessment.beneficial_ingredients || [])
    .map(b => `  - ${b.ingredient}: ${b.benefit}`)
    .join('\n')

  // Build efficacy context
  const efficacyLines = Object.entries(assessment.efficacy_results || {})
    .map(([concern, e]) => `  - ${concern}: ${e.efficacy_verdict || ''} (score ${e.efficacy_score ?? '?'}/100) — ${e.verdict_reason || ''}`)
    .join('\n')

  // Build physiology context
  const physiologyLines = [
    `Skin type: ${profile.skin_type || 'not specified'}`,
    `Skin concerns: ${profile.skin_concerns?.join(', ') || 'none'}`,
    `Gender identity: ${profile.gender_identity || 'not specified'}`,
    `Age range: ${profile.age_range || 'not specified'}`,
    `Hormone therapy: ${profile.hormone_therapy || 'none'}`,
    `Pregnancy/breastfeeding: ${profile.pregnancy_status || 'no'}`,
    `Hormonal conditions: ${profile.hormonal_conditions?.join(', ') || 'none'}`,
    `Sun exposure: ${profile.sun_exposure || 'not specified'}`,
    `Known reactions: ${profile.known_reactions || 'none'}`,
    profile.additional_notes ? `Additional notes: ${profile.additional_notes}` : null,
  ].filter(Boolean).join('\n')

  const product = assessment.products
  const productLine = product
    ? `${product.name}${product.brand ? ` by ${product.brand}` : ''}`
    : 'Unknown product'

  const systemPrompt = `You are a knowledgeable, warm cosmetics advisor. Answer in plain English like a knowledgeable friend who understands cosmetic chemistry. Be direct and specific. Never recommend seeing a doctor unless it is genuinely urgent. Never be salesy.

PRODUCT: ${productLine}

INGREDIENT LIST:
${product?.raw_ingredients || 'Not available'}

SAFETY ASSESSMENT:
Verdict: ${assessment.safety_verdict || 'unknown'}
Summary: ${assessment.safety_summary || 'none'}
${flagged ? `Flagged ingredients:\n${flagged}` : 'No flagged ingredients.'}
${beneficial ? `Beneficial ingredients:\n${beneficial}` : ''}

EFFICACY ASSESSMENT:
${efficacyLines || 'No efficacy data available.'}

USER PROFILE:
${physiologyLines}

Answer only questions about this specific product and how it relates to this user's profile. Keep answers concise — 2-4 sentences unless a longer answer is clearly needed.`

  // Build messages for Claude (strip timestamps)
  const claudeMessages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: claudeMessages,
    })

    const replyContent = response.content.find(b => b.type === 'text')?.text
    if (!replyContent) throw new Error('No response from Claude')

    const timestamp = new Date().toISOString()
    const userMessage = { role: 'user', content: message, timestamp }
    const assistantMessage = { role: 'assistant', content: replyContent, timestamp }

    // Persist both messages atomically
    await adminClient.rpc('append_chat_messages', {
      p_assessment_id: assessmentId,
      p_user_message: userMessage,
      p_assistant_message: assistantMessage,
    })

    return res.status(200).json({ reply: replyContent })

  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'Failed to get a response' })
  }
}
