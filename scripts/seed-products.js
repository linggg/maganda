import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Load .env.local from project root
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Product list
// ---------------------------------------------------------------------------
const PRODUCTS = [
  // Korean Skincare
  { name: 'COSRX Low pH Good Morning Gel Cleanser', brand: 'COSRX', category: 'skincare' },
  { name: 'Banila Co Clean It Zero Cleansing Balm', brand: 'Banila Co', category: 'skincare' },
  { name: 'Heimish All Clean Balm', brand: 'Heimish', category: 'skincare' },
  { name: 'The Face Shop Rice Water Bright Cleansing Foam', brand: 'The Face Shop', category: 'skincare' },
  { name: 'Innisfree Green Tea Foam Cleanser', brand: 'Innisfree', category: 'skincare' },
  { name: 'NEOGEN Real Fresh Foam Green Tea', brand: 'NEOGEN', category: 'skincare' },
  { name: 'Pyunkang Yul Essence Toner', brand: 'Pyunkang Yul', category: 'skincare' },
  { name: 'Klairs Supple Preparation Unscented Toner', brand: 'Klairs', category: 'skincare' },
  { name: 'Innisfree Green Tea Seed Serum', brand: 'Innisfree', category: 'skincare' },
  { name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner', brand: 'Some By Mi', category: 'skincare' },
  { name: 'Missha Time Revolution The First Treatment Essence', brand: 'Missha', category: 'skincare' },
  { name: 'Laneige Cream Skin Toner & Moisturiser', brand: 'Laneige', category: 'skincare' },
  { name: 'COSRX Advanced Snail 96 Mucin Power Essence', brand: 'COSRX', category: 'skincare' },
  { name: 'COSRX The Niacinamide 15 Serum', brand: 'COSRX', category: 'skincare' },
  { name: 'Some By Mi Snail Truecica Miracle Repair Serum', brand: 'Some By Mi', category: 'skincare' },
  { name: 'Mediheal N.M.F Intensive Hydrating Serum', brand: 'Mediheal', category: 'skincare' },
  { name: 'Skin1004 Madagascar Centella Ampoule', brand: 'Skin1004', category: 'skincare' },
  { name: 'Torriden Dive-In Low Molecular Hyaluronic Acid Serum', brand: 'Torriden', category: 'skincare' },
  { name: 'Anua Heartleaf 77% Soothing Toner', brand: 'Anua', category: 'skincare' },
  { name: 'Laneige Water Sleeping Mask', brand: 'Laneige', category: 'skincare' },
  { name: 'COSRX Oil-Free Ultra-Moisturizing Lotion', brand: 'COSRX', category: 'skincare' },
  { name: 'Etude House SoonJung 2x Barrier Intensive Cream', brand: 'Etude House', category: 'skincare' },
  { name: 'Belif The True Cream Aqua Bomb', brand: 'Belif', category: 'skincare' },
  { name: 'Innisfree Green Tea Seed Cream', brand: 'Innisfree', category: 'skincare' },
  { name: 'Dr. Jart+ Ceramidin Cream', brand: 'Dr. Jart+', category: 'skincare' },
  { name: 'Klairs Midnight Blue Calming Cream', brand: 'Klairs', category: 'skincare' },
  { name: 'COSRX Aloe Soothing Sun Cream SPF50', brand: 'COSRX', category: 'skincare' },
  { name: 'Innisfree Daily UV Defense Sunscreen SPF36', brand: 'Innisfree', category: 'skincare' },
  { name: 'Missha All Around Safe Block Soft Finish Sun Milk', brand: 'Missha', category: 'skincare' },
  { name: 'Skin Aqua Tone Up UV Essence SPF50', brand: 'Skin Aqua', category: 'skincare' },
  { name: 'Round Lab Birch Juice Moisturizing Sun Cream', brand: 'Round Lab', category: 'skincare' },
  { name: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF50', brand: 'Beauty of Joseon', category: 'skincare' },
  { name: 'Purito Daily Go-To Sunscreen SPF50', brand: 'Purito', category: 'skincare' },
  { name: 'COSRX Acne Pimple Master Patch', brand: 'COSRX', category: 'skincare' },
  { name: 'Some By Mi Bye Bye Blemish Vita Tox Brightening Cream', brand: 'Some By Mi', category: 'skincare' },
  { name: 'Mediheal Tea Tree Essential Blemish Control Spot Patch', brand: 'Mediheal', category: 'skincare' },

  // International Skincare
  { name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', category: 'skincare' },
  { name: 'CeraVe Foaming Facial Cleanser', brand: 'CeraVe', category: 'skincare' },
  { name: 'La Roche-Posay Toleriane Hydrating Gentle Cleanser', brand: 'La Roche-Posay', category: 'skincare' },
  { name: 'Neutrogena Hydro Boost Hydrating Cleansing Gel', brand: 'Neutrogena', category: 'skincare' },
  { name: 'Simple Kind to Skin Moisturising Facial Wash', brand: 'Simple', category: 'skincare' },
  { name: 'Cetaphil Gentle Skin Cleanser', brand: 'Cetaphil', category: 'skincare' },
  { name: 'The Ordinary Squalane Cleanser', brand: 'The Ordinary', category: 'skincare' },
  { name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: 'skincare' },
  { name: 'The Ordinary Glycolic Acid 7% Toning Solution', brand: 'The Ordinary', category: 'skincare' },
  { name: 'Pixi Glow Tonic', brand: 'Pixi', category: 'skincare' },
  { name: 'Thayers Witch Hazel Toner', brand: 'Thayers', category: 'skincare' },
  { name: 'Mario Badescu Facial Spray with Aloe Herbs and Rosewater', brand: 'Mario Badescu', category: 'skincare' },
  { name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', category: 'skincare' },
  { name: 'The Ordinary Hyaluronic Acid 2% + B5', brand: 'The Ordinary', category: 'skincare' },
  { name: 'The Ordinary Retinol 0.5% in Squalane', brand: 'The Ordinary', category: 'skincare' },
  { name: 'The Ordinary AHA 30% + BHA 2% Peeling Solution', brand: 'The Ordinary', category: 'skincare' },
  { name: 'Vichy Mineral 89 Hyaluronic Acid Serum', brand: 'Vichy', category: 'skincare' },
  { name: 'La Roche-Posay Pure Vitamin C10 Serum', brand: 'La Roche-Posay', category: 'skincare' },
  { name: 'Skinceuticals C E Ferulic', brand: 'Skinceuticals', category: 'skincare' },
  { name: 'Drunk Elephant C-Firma Fresh Day Serum', brand: 'Drunk Elephant', category: 'skincare' },
  { name: 'Olay Regenerist Micro-Sculpting Serum', brand: 'Olay', category: 'skincare' },
  { name: "L'Oréal Paris Revitalift 1.5% Pure Hyaluronic Acid Serum", brand: "L'Oréal Paris", category: 'skincare' },
  { name: 'CeraVe Moisturising Cream', brand: 'CeraVe', category: 'skincare' },
  { name: 'La Roche-Posay Toleriane Double Repair Moisturiser', brand: 'La Roche-Posay', category: 'skincare' },
  { name: 'Neutrogena Hydro Boost Water Gel', brand: 'Neutrogena', category: 'skincare' },
  { name: 'Cetaphil Moisturising Cream', brand: 'Cetaphil', category: 'skincare' },
  { name: "Kiehl's Ultra Facial Cream", brand: "Kiehl's", category: 'skincare' },
  { name: 'First Aid Beauty Ultra Repair Cream', brand: 'First Aid Beauty', category: 'skincare' },
  { name: 'Eucerin Original Healing Cream', brand: 'Eucerin', category: 'skincare' },
  { name: 'Aveeno Daily Moisturising Lotion', brand: 'Aveeno', category: 'skincare' },
  { name: 'Weleda Skin Food Original Ultra-Rich Cream', brand: 'Weleda', category: 'skincare' },
  { name: 'La Roche-Posay Anthelios Melt-In Milk SPF100', brand: 'La Roche-Posay', category: 'skincare' },
  { name: 'Neutrogena Ultra Sheer Dry-Touch SPF100', brand: 'Neutrogena', category: 'skincare' },
  { name: 'EltaMD UV Clear Broad-Spectrum SPF46', brand: 'EltaMD', category: 'skincare' },
  { name: 'Supergoop Unseen Sunscreen SPF40', brand: 'Supergoop', category: 'skincare' },
  { name: 'Biore UV Aqua Rich Watery Essence SPF50', brand: 'Biore', category: 'skincare' },
  { name: "Kiehl's Creamy Eye Treatment with Avocado", brand: "Kiehl's", category: 'skincare' },
  { name: 'CeraVe Eye Repair Cream', brand: 'CeraVe', category: 'skincare' },
  { name: 'Olay Eyes Ultimate Eye Cream', brand: 'Olay', category: 'skincare' },

  // SEA / Local Brands
  { name: 'Hada Labo Gokujyun Ultimate Moisturising Face Wash', brand: 'Hada Labo', category: 'skincare' },
  { name: 'Hada Labo Gokujyun Premium Hyaluronic Lotion', brand: 'Hada Labo', category: 'skincare' },
  { name: 'Senka Perfect Whip Cleansing Foam', brand: 'Senka', category: 'skincare' },
  { name: 'Biore Marshmallow Whip Moisture Facial Foam', brand: 'Biore', category: 'skincare' },
  { name: "Pond's Bright Beauty Spot-less Glow Serum", brand: "Pond's", category: 'skincare' },
  { name: 'Olay Total Effects 7-in-1 Anti-Ageing Moisturiser', brand: 'Olay', category: 'skincare' },
  { name: 'Garnier Bright Complete Vitamin C Serum', brand: 'Garnier', category: 'skincare' },
  { name: "L'Oréal Paris Revitalift Crystal Micro-Essence", brand: "L'Oréal Paris", category: 'skincare' },
  { name: 'Nivea Extra Bright Firming Serum', brand: 'Nivea', category: 'skincare' },
  { name: 'SK-II Facial Treatment Essence', brand: 'SK-II', category: 'skincare' },
  { name: 'SK-II Stempower Cream', brand: 'SK-II', category: 'skincare' },
  { name: 'Sulwhasoo First Care Activating Serum', brand: 'Sulwhasoo', category: 'skincare' },

  // Haircare
  { name: 'AMOS Professional Scalp & Hair Shampoo', brand: 'AMOS Professional', category: 'haircare' },
  { name: 'Mise En Scene Perfect Serum Original', brand: 'Mise En Scene', category: 'haircare' },
  { name: 'Elastine Perfume Shampoo', brand: 'Elastine', category: 'haircare' },
  { name: 'Moroccan Oil Treatment', brand: 'Moroccan Oil', category: 'haircare' },
  { name: 'Ryo Anti Hair Loss Shampoo', brand: 'Ryo', category: 'haircare' },
  { name: 'Lador Tea Tree Scalp Hair Pack', brand: 'Lador', category: 'haircare' },
  { name: 'Pantene Pro-V Repair & Protect Shampoo', brand: 'Pantene', category: 'haircare' },
  { name: 'Dove Intensive Repair Shampoo', brand: 'Dove', category: 'haircare' },
  { name: 'TRESemmé Keratin Smooth Shampoo', brand: 'TRESemmé', category: 'haircare' },
  { name: 'Head & Shoulders Classic Clean Shampoo', brand: 'Head & Shoulders', category: 'haircare' },
  { name: 'Sunsilk Smooth & Manageable Shampoo', brand: 'Sunsilk', category: 'haircare' },
  { name: 'Garnier Fructis Sleek & Shine Shampoo', brand: 'Garnier', category: 'haircare' },
  { name: "L'Oréal Elvive Extraordinary Oil Shampoo", brand: "L'Oréal", category: 'haircare' },
  { name: 'Schwarzkopf Gliss Hair Repair Shampoo', brand: 'Schwarzkopf', category: 'haircare' },
  { name: 'Herbal Essences Bio:Renew Argan Oil Shampoo', brand: 'Herbal Essences', category: 'haircare' },
  { name: 'OGX Argan Oil of Morocco Shampoo', brand: 'OGX', category: 'haircare' },
  { name: 'Briogeo Don\'t Despair Repair Deep Conditioning Mask', brand: 'Briogeo', category: 'haircare' },
  { name: 'Olaplex No.3 Hair Perfector', brand: 'Olaplex', category: 'haircare' },
  { name: 'Olaplex No.4 Bond Maintenance Shampoo', brand: 'Olaplex', category: 'haircare' },
  { name: 'Olaplex No.5 Bond Maintenance Conditioner', brand: 'Olaplex', category: 'haircare' },
  { name: 'Kérastase Nutritive Bain Satin Shampoo', brand: 'Kérastase', category: 'haircare' },
  { name: 'Redken All Soft Shampoo', brand: 'Redken', category: 'haircare' },
  { name: 'Wella Professionals Enrich Moisturising Shampoo', brand: 'Wella', category: 'haircare' },
  { name: 'Pantene Gold Series Deep Hydrating Co-Wash', brand: 'Pantene', category: 'haircare' },
  { name: 'Cantu Shea Butter for Natural Hair Cleansing Cream Shampoo', brand: 'Cantu', category: 'haircare' },
  { name: 'SheaMoisture Manuka Honey & Mafura Oil Intensive Hydration Shampoo', brand: 'SheaMoisture', category: 'haircare' },

  // Bodycare
  { name: 'Vaseline Intensive Care Deep Restore Lotion', brand: 'Vaseline', category: 'bodycare' },
  { name: 'Nivea Essentially Enriched Body Lotion', brand: 'Nivea', category: 'bodycare' },
  { name: 'Jergens Ultra Healing Extra Dry Skin Moisturiser', brand: 'Jergens', category: 'bodycare' },
  { name: "Palmer's Cocoa Butter Formula with Vitamin E", brand: "Palmer's", category: 'bodycare' },
  { name: 'Cetaphil Moisturising Lotion', brand: 'Cetaphil', category: 'bodycare' },
  { name: 'Dove Deep Moisture Body Wash', brand: 'Dove', category: 'bodycare' },
  { name: 'Olay Ultra Moisture Body Wash with Shea Butter', brand: 'Olay', category: 'bodycare' },
  { name: 'Neutrogena Body Clear Body Wash', brand: 'Neutrogena', category: 'bodycare' },
  { name: 'The Body Shop Shea Body Butter', brand: 'The Body Shop', category: 'bodycare' },
  { name: "Kiehl's Creme de Corps", brand: "Kiehl's", category: 'bodycare' },
  { name: 'CeraVe Moisturising Lotion', brand: 'CeraVe', category: 'bodycare' },
  { name: 'Aveeno Skin Relief Moisturising Lotion', brand: 'Aveeno', category: 'bodycare' },
  { name: 'Bio-Oil Skincare Oil', brand: 'Bio-Oil', category: 'bodycare' },
  { name: "L'Occitane Shea Butter Hand Cream", brand: "L'Occitane", category: 'bodycare' },
  { name: 'Neutrogena Norwegian Formula Hand Cream', brand: 'Neutrogena', category: 'bodycare' },
  { name: "O'Keeffe's Working Hands Hand Cream", brand: "O'Keeffe's", category: 'bodycare' },
  { name: "Burt's Bees Milk & Honey Body Lotion", brand: "Burt's Bees", category: 'bodycare' },
  { name: 'Hempz Original Herbal Body Moisturiser', brand: 'Hempz', category: 'bodycare' },
  { name: 'Gold Bond Ultimate Healing Skin Therapy Lotion', brand: 'Gold Bond', category: 'bodycare' },
  { name: 'Eucerin Advanced Repair Lotion', brand: 'Eucerin', category: 'bodycare' },

  // Makeup
  { name: 'Maybelline Fit Me Matte + Poreless Foundation', brand: 'Maybelline', category: 'makeup' },
  { name: "L'Oréal Paris True Match Foundation", brand: "L'Oréal Paris", category: 'makeup' },
  { name: 'NYX Professional Makeup Matte Finish Setting Spray', brand: 'NYX', category: 'makeup' },
  { name: 'Maybelline SuperStay Full Coverage Foundation', brand: 'Maybelline', category: 'makeup' },
  { name: 'MAC Studio Fix Fluid SPF15', brand: 'MAC', category: 'makeup' },
  { name: "Fenty Beauty Pro Filt'r Soft Matte Foundation", brand: 'Fenty Beauty', category: 'makeup' },
  { name: 'NARS Natural Radiant Longwear Foundation', brand: 'NARS', category: 'makeup' },
  { name: 'Charlotte Tilbury Flawless Finish Foundation', brand: 'Charlotte Tilbury', category: 'makeup' },
  { name: 'Estée Lauder Double Wear Stay-in-Place Foundation', brand: 'Estée Lauder', category: 'makeup' },
  { name: 'Rare Beauty Liquid Touch Weightless Foundation', brand: 'Rare Beauty', category: 'makeup' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIngredients(raw) {
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

async function getIngredients(name, brand) {
  const prompt =
    `Find the official ingredient list for ${brand} ${name}. ` +
    `Return ONLY a comma-separated list of ingredients exactly as they appear on the product label. ` +
    `No explanation, no markdown, just the ingredient list. ` +
    `If you cannot find the exact ingredient list, respond with exactly: NOT_FOUND`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
  })

  // Extract the last text block — appears after any tool use blocks
  const textBlock = [...response.content].reverse().find(b => b.type === 'text')
  const text = textBlock?.text?.trim() ?? ''

  if (!text || text === 'NOT_FOUND') return null
  return text
}

async function seedProduct(product, index, total) {
  const label = `${product.brand} ${product.name}`
  const prefix = `[${String(index + 1).padStart(3, '0')}/${total}]`

  // Check for existing row
  const { data: existing, error: selectError } = await supabase
    .from('products')
    .select('id')
    .eq('name', product.name)
    .eq('brand', product.brand)
    .maybeSingle()

  if (selectError) {
    console.log(`${prefix} ✗ ${label} — failed: ${selectError.message}`)
    return 'failed'
  }

  if (existing) {
    console.log(`${prefix} ⟳ ${label} — already exists`)
    return 'existed'
  }

  // Fetch ingredients via Claude + web search
  let rawIngredients
  try {
    rawIngredients = await getIngredients(product.name, product.brand)
  } catch (err) {
    console.log(`${prefix} ✗ ${label} — failed: ${err.message}`)
    return 'failed'
  }

  if (!rawIngredients) {
    console.log(`${prefix} ✗ ${label} — failed: NOT_FOUND`)
    return 'failed'
  }

  const parsedIngredients = parseIngredients(rawIngredients)

  const { error: insertError } = await supabase.from('products').insert([{
    name: product.name,
    brand: product.brand,
    product_type: product.category,
    raw_ingredients: rawIngredients,
    parsed_ingredients: parsedIngredients,
    source: 'seed',
  }])

  if (insertError) {
    console.log(`${prefix} ✗ ${label} — failed: ${insertError.message}`)
    return 'failed'
  }

  console.log(`${prefix} ✓ ${label} — inserted`)
  return 'inserted'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nMaganda product seeder — ${PRODUCTS.length} products\n`)

  let inserted = 0
  let existed = 0
  let failed = 0

  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await seedProduct(PRODUCTS[i], i, PRODUCTS.length)
    if (result === 'inserted') inserted++
    else if (result === 'existed') existed++
    else failed++

    if (i < PRODUCTS.length - 1) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log(`
────────────────────────────────
  Seeding complete
  ✓ Inserted:       ${inserted}
  ⟳ Already existed: ${existed}
  ✗ Failed:         ${failed}
  Total:            ${PRODUCTS.length}
────────────────────────────────
`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
