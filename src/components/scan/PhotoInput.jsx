import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const CONFIDENCE_BADGE = {
  high:   { bg: '#ceeacf', color: '#092010', icon: 'check_circle' },
  medium: { bg: '#ffd9de', color: '#2e1319', icon: 'info' },
  low:    { bg: '#ffdad6', color: '#93000a', icon: 'warning' },
}

// Resize image to max 1600px and convert to base64 JPEG via Canvas
function resizeAndEncode(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round(height * MAX / width)
          width = MAX
        } else {
          width = Math.round(width * MAX / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
      resolve(base64)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PhotoInput({ onConfirm, onProductFound, onSwitchToPaste, submitting }) {
  const { t } = useTranslation()

  const [phase, setPhase] = useState('idle') // idle | processing | confirming | found_product | error
  const [errorMsg, setErrorMsg] = useState('')
  const [preview, setPreview] = useState(null)
  const [ingredients, setIngredients] = useState('')
  const [productName, setProductName] = useState('')
  const [brand, setBrand] = useState('')
  const [confidence, setConfidence] = useState('medium')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setPhase('processing')

    try {
      const imageBase64 = await resizeAndEncode(file)

      const res = await fetch('/api/ocr/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
      })

      if (!res.ok) {
        setErrorMsg(t('check.ocr_error_failed'))
        setPhase('error')
        return
      }

      const { cleaned } = await res.json()
      const hasIngredients = cleaned?.ingredients?.trim()
      const hasProduct = cleaned?.product_name || cleaned?.brand

      if (hasIngredients) {
        setIngredients(cleaned.ingredients)
        setProductName(cleaned.product_name || '')
        setBrand(cleaned.brand || '')
        setConfidence(cleaned.confidence || 'medium')
        setPhase('confirming')
      } else if (hasProduct) {
        const name = cleaned.product_name || ''
        const br = cleaned.brand || ''
        setProductName(name)
        setBrand(br)
        if (cleaned.confidence === 'high') {
          onProductFound(name, br)
        } else {
          setPhase('found_product')
        }
      } else {
        setErrorMsg(t('check.ocr_error_no_ingredients'))
        setPhase('error')
      }

    } catch (err) {
      console.error('OCR error:', err)
      setErrorMsg(t('check.ocr_error_failed'))
      setPhase('error')
    }
  }

  function reset() {
    setPhase('idle')
    setErrorMsg('')
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setIngredients('')
    setProductName('')
    setBrand('')
  }

  const badge = CONFIDENCE_BADGE[confidence] ?? CONFIDENCE_BADGE.medium

  return (
    <div>
      {/* Inputs always mounted — never conditionally rendered, so onChange fires reliably */}
      <input
        id="ocr-camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
      <input
        id="ocr-gallery-input"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      {phase === 'idle' && (
        <div>
          <p className="text-sm mb-6" style={{ color: '#737972' }}>
            {t('check.ocr_subtitle')}
          </p>
          <label
            htmlFor="ocr-camera-input"
            className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-opacity active:opacity-70 cursor-pointer"
            style={{ borderColor: '#49624d', backgroundColor: '#f0f4f1' }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '48px', color: '#49624d', fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              photo_camera
            </span>
            <span className="text-sm font-bold" style={{ color: '#49624d' }}>
              {t('check.ocr_take_photo')}
            </span>
          </label>

          <label
            htmlFor="ocr-gallery-input"
            className="w-full flex items-center justify-center gap-2 py-3 mt-3 rounded-xl transition-opacity active:opacity-70 cursor-pointer"
            style={{ color: '#49624d' }}
          >
            <span className="material-symbols-outlined text-base">photo_library</span>
            <span className="text-sm font-semibold">{t('check.ocr_upload_gallery')}</span>
          </label>

          <p className="text-xs mt-4 text-center" style={{ color: '#a0a5a1' }}>
            {t('check.ocr_tip')}
          </p>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center justify-center py-16 gap-5">
          {preview && (
            <img
              src={preview}
              alt=""
              className="w-28 h-28 object-cover rounded-xl opacity-60"
            />
          )}
          <div
            className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{ borderColor: '#49624d', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-semibold" style={{ color: '#49624d' }}>
            {t('check.ocr_reading')}
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <span className="material-symbols-outlined text-4xl" style={{ color: '#775259' }}>
            hide_image
          </span>
          <p className="text-sm font-semibold" style={{ color: '#191c1c' }}>
            {errorMsg}
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#49624d', color: '#ffffff' }}
          >
            {t('check.ocr_retry')}
          </button>
          <button
            onClick={onSwitchToPaste}
            className="text-sm underline underline-offset-2"
            style={{ color: '#49624d' }}
          >
            {t('check.ocr_switch_paste')}
          </button>
        </div>
      )}

      {phase === 'confirming' && (
        <div className="space-y-4">
          {(productName || brand) && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#eceeed' }}>
              {productName && (
                <p className="font-semibold text-sm" style={{ color: '#191c1c' }}>
                  {productName}
                </p>
              )}
              {brand && (
                <p className="text-xs mt-0.5" style={{ color: '#737972' }}>
                  {brand}
                </p>
              )}
            </div>
          )}

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {badge.icon}
            </span>
            {t(`check.ocr_confidence_${confidence}`)}
          </div>

          <div>
            <label
              htmlFor="ocr-ingredient-edit"
              className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: '#737972' }}
            >
              {t('check.ocr_ingredient_label')}
            </label>
            <textarea
              id="ocr-ingredient-edit"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              rows={7}
              className="w-full rounded-xl p-4 text-sm resize-none border focus:outline-none"
              style={{ backgroundColor: '#ffffff', borderColor: '#d4d8d5', color: '#191c1c' }}
            />
          </div>

          <button
            onClick={() => onConfirm(ingredients.trim(), productName || null, brand || null)}
            disabled={!ingredients.trim() || submitting}
            className="w-full py-4 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: '#49624d', color: '#ffffff' }}
          >
            {submitting ? t('check.analysing') : t('check.ocr_confirm_button')}
          </button>

          <button
            onClick={reset}
            className="w-full py-3 text-sm font-medium"
            style={{ color: '#49624d' }}
          >
            {t('check.ocr_retry')}
          </button>
        </div>
      )}
      {phase === 'found_product' && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: '#eceeed' }}>
            {productName && (
              <p className="font-semibold text-sm" style={{ color: '#191c1c' }}>{productName}</p>
            )}
            {brand && (
              <p className="text-xs mt-0.5" style={{ color: '#737972' }}>{brand}</p>
            )}
          </div>

          <p className="text-sm" style={{ color: '#737972' }}>
            {t('check.ocr_no_ingredients_visible')}
          </p>

          <button
            onClick={() => onProductFound(productName, brand)}
            className="w-full py-4 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#49624d', color: '#ffffff' }}
          >
            {t('check.ocr_search_ingredients')}
          </button>

          <button
            onClick={reset}
            className="w-full py-3 text-sm font-medium"
            style={{ color: '#49624d' }}
          >
            {t('check.ocr_retry')}
          </button>
        </div>
      )}


    </div>
  )
}
