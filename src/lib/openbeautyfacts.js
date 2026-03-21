const BASE_URL = 'https://world.openbeautyfacts.org'

export async function searchProducts(query) {
  if (!query || query.trim().length < 2) return []
  
  try {
    const response = await fetch(
      `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=id,product_name,brands,ingredients_text,image_url,categories`
    )
    if (!response.ok) throw new Error('Search failed')
    const data = await response.json()
    return data.products || []
  } catch (err) {
    console.error('Open Beauty Facts search error:', err)
    return []
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${id}.json`)
    if (!response.ok) throw new Error('Product fetch failed')
    const data = await response.json()
    return data.product || null
  } catch (err) {
    console.error('Open Beauty Facts fetch error:', err)
    return null
  }
}

export function parseIngredients(ingredientsText) {
  if (!ingredientsText) return []
  return ingredientsText
    .split(/,|;/)
    .map(i => i.trim())
    .filter(i => i.length > 0)
}