import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

export default function AssessmentChat({ assessment }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(assessment?.chat_history || [])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [drag, setDrag] = useState({ active: false, startY: 0, deltaY: 0 })

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  const atLimit = messages.length >= 10
  const hasHistory = messages.length > 0

  // Scroll to bottom when thread updates or sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages, open, sending])

  // Focus input when sheet opens
  useEffect(() => {
    if (open && !atLimit) {
      setTimeout(() => inputRef.current?.focus(), 320)
    }
  }, [open])

  function handleOpen() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setDrag({ active: false, startY: 0, deltaY: 0 })
  }

  // --- Drag to dismiss ---
  function onDragStart(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ active: true, startY: e.clientY, deltaY: 0 })
  }

  function onDragMove(e) {
    if (!drag.active) return
    const delta = Math.max(0, e.clientY - drag.startY)
    setDrag(prev => ({ ...prev, deltaY: delta }))
  }

  function onDragEnd() {
    if (drag.deltaY > 80) {
      handleClose()
    } else {
      setDrag({ active: false, startY: 0, deltaY: 0 })
    }
  }

  // --- Send message ---
  async function handleSend() {
    const text = input.trim()
    if (!text || sending || atLimit) return

    setError(null)
    setSending(true)

    const optimisticUser = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, optimisticUser])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) throw new Error('Not authenticated')

      const res = await fetch('/api/assessment/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          message: text,
          accessToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => prev.filter(m => m !== optimisticUser))
        setInput(text)
        throw new Error(data.error || 'Failed')
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

    } catch (err) {
      console.error('Chat error:', err)
      setError(t('chat.error'))
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Sheet transform: dragging overrides CSS transition
  const sheetTransform = drag.active
    ? `translateY(${drag.deltaY}px)`
    : open ? 'translateY(0)' : 'translateY(100%)'

  const sheetTransition = drag.active ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'

  return (
    <>
      {/* Fixed footer bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '28rem',
          margin: '0 auto',
          zIndex: 40,
          backgroundColor: '#49624d',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <button
          onClick={handleOpen}
          className="w-full flex items-center gap-3 px-5 py-4 transition-opacity active:opacity-80"
        >
          <span className="material-symbols-outlined text-base flex-shrink-0" style={{ color: '#ceeacf' }}>
            chat
          </span>
          <span className="text-sm font-semibold flex-1 text-left" style={{ color: '#ffffff' }}>
            {hasHistory ? t('chat.prompt_button_resume') : t('chat.prompt_button')}
          </span>
          <span className="material-symbols-outlined text-base flex-shrink-0" style={{ color: '#ceeacf' }}>
            expand_less
          </span>
        </button>
      </div>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '28rem',
          margin: '0 auto',
          zIndex: 61,
          height: '60vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          transform: sheetTransform,
          transition: sheetTransition,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          className="flex flex-col items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
          style={{ height: '40px', touchAction: 'none' }}
        >
          <div
            style={{
              width: '32px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#d4d8d5',
            }}
          />
        </div>

        {/* Header row */}
        <div
          className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
        >
          <span className="text-sm font-bold" style={{ color: '#191c1c' }}>
            {t('chat.title')}
          </span>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{ backgroundColor: '#eceeed' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#49624d' }}>
              close
            </span>
          </button>
        </div>

        {/* Message thread */}
        <div
          className="flex-1 overflow-y-auto px-4 space-y-3"
          style={{ paddingBottom: '8px' }}
        >
          {messages.length === 0 && !sending && (
            <p className="text-xs text-center pt-6" style={{ color: '#a0a5a1' }}>
              {t('chat.empty_hint')}
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="text-sm leading-relaxed px-4 py-2.5"
                style={
                  msg.role === 'user'
                    ? {
                        backgroundColor: '#49624d',
                        color: '#ffffff',
                        maxWidth: '80%',
                        borderRadius: '18px 18px 4px 18px',
                      }
                    : {
                        backgroundColor: '#f2f4f3',
                        color: '#191c1c',
                        maxWidth: '85%',
                        borderRadius: '18px 18px 18px 4px',
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div
                className="flex gap-1 items-center px-4 py-3"
                style={{ backgroundColor: '#f2f4f3', borderRadius: '18px 18px 18px 4px' }}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: '#737972', animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          className="flex-shrink-0"
          style={{
            borderTop: '1px solid #e1e3e2',
            paddingBottom: 'env(safe-area-inset-bottom)',
            backgroundColor: '#ffffff',
          }}
        >
          {atLimit ? (
            <p className="text-xs text-center px-4 py-4" style={{ color: '#737972' }}>
              {t('chat.limit_reached')}
            </p>
          ) : (
            <div className="flex items-end gap-2 px-3 py-3">
              <textarea
                ref={el => { inputRef.current = el; textareaRef.current = el }}
                rows={1}
                className="flex-1 text-sm resize-none rounded-xl px-3 py-2.5 outline-none"
                style={{
                  backgroundColor: '#f2f4f3',
                  color: '#191c1c',
                  maxHeight: '96px',
                  lineHeight: '1.4',
                }}
                placeholder={t('chat.input_placeholder')}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
                style={{ backgroundColor: '#49624d' }}
              >
                <span className="material-symbols-outlined text-base" style={{ color: '#ffffff' }}>
                  send
                </span>
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs px-4 pb-3" style={{ color: '#93000a' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
