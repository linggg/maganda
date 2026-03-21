import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PasteInput({ onSubmit }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')

  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase mb-3"
        style={{ color: '#775259' }}>
        {t('scan.paste_label')}
      </p>
      <textarea
        className="w-full rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 resize-none transition-all"
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #e1e3e2',
          focusRingColor: '#49624d'
        }}
        rows={5}
        placeholder={t('scan.paste_placeholder')}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        onClick={() => onSubmit(text)}
        disabled={text.trim().length < 10}
        style={text.trim().length >= 10 ? { backgroundColor: '#49624d', color: '#ffffff' } : {}}
        className="w-full mt-3 py-4 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-surface-container-high text-on-surface-variant"
      >
        {t('scan.analyse_ingredients')}
      </button>
    </div>
  )
}