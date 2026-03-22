import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'th', label: 'ภาษาไทย' },
  { code: 'ko', label: '한국어' },
  { code: 'fil', label: 'Filipino' },
  { code: 'zh', label: '中文' },
]

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '')
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [passwordSent, setPasswordSent] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const sections = [
    {
      key: 'face',
      label: t('profile.completeness_face'),
      complete: !!profile?.skin_type,
      path: '/profile/face',
    },
    {
      key: 'scalp_hair',
      label: t('profile.completeness_scalp_hair'),
      complete: !!profile?.scalp_type,
      path: '/profile/extended',
    },
    {
      key: 'body',
      label: t('profile.completeness_body'),
      complete: profile?.body_concerns != null,
      path: '/profile/extended',
    },
    {
      key: 'nails',
      label: t('profile.completeness_nails'),
      complete: profile?.nail_concerns != null,
      path: '/profile/extended',
    },
    {
      key: 'notes',
      label: t('profile.completeness_notes'),
      complete: !!profile?.additional_notes,
      path: '/profile/notes',
    },
  ]

  const completedCount = sections.filter(s => s.complete).length

  async function handleSaveName() {
    setSavingName(true)
    await supabase.auth.updateUser({ data: { full_name: displayName.trim() } })
    setSavingName(false)
    setEditingName(false)
  }

  async function handleChangePassword() {
    await supabase.auth.resetPasswordForEmail(user.email)
    setPasswordSent(true)
  }

  async function handleLogout() {
    await signOut()
    navigate('/auth', { replace: true })
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      await signOut()
      navigate('/auth', { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-24 pb-32 px-6 space-y-8">

        {/* Account */}
        <section>
          <p className="text-xs font-bold tracking-widest uppercase text-tertiary mb-4">
            {t('profile.account_section')}
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e6e9e8' }}>
            {/* Display name */}
            <div
              className="px-4 py-4 bg-white flex items-center gap-3"
              style={{ borderBottom: '1px solid #e6e9e8' }}
            >
              <span className="text-xs font-semibold text-on-surface-variant w-24 flex-shrink-0">
                {t('profile.display_name_label')}
              </span>
              {editingName ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="flex-1 text-sm text-on-surface bg-transparent focus:outline-none"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    style={{ backgroundColor: '#49624d', color: '#ffffff' }}
                  >
                    {savingName ? '...' : t('profile.save')}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="flex-1 text-sm text-on-surface">
                    {displayName || (
                      <span className="text-outline/50">{t('profile.display_name_placeholder')}</span>
                    )}
                  </span>
                  <button onClick={() => setEditingName(true)} className="p-1">
                    <span className="material-symbols-outlined text-base" style={{ color: '#737972' }}>
                      edit
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div
              className="px-4 py-4 bg-white flex items-center gap-3"
              style={{ borderBottom: '1px solid #e6e9e8' }}
            >
              <span className="text-xs font-semibold text-on-surface-variant w-24 flex-shrink-0">
                {t('profile.email_label')}
              </span>
              <span className="flex-1 text-sm text-on-surface">{user?.email}</span>
            </div>

            {/* Change password */}
            <div className="px-4 py-4 bg-white">
              {passwordSent ? (
                <span className="text-sm font-medium" style={{ color: '#49624d' }}>
                  {t('profile.password_sent')}
                </span>
              ) : (
                <button
                  onClick={handleChangePassword}
                  className="text-sm font-medium transition-all active:opacity-70"
                  style={{ color: '#49624d' }}
                >
                  {t('profile.change_password')}
                </button>
              )}
            </div>
          </div>

          {/* Language */}
          <div
            className="mt-3 rounded-2xl px-4 py-4 flex items-center gap-3 bg-white"
            style={{ border: '1px solid #e6e9e8' }}
          >
            <span className="text-xs font-semibold text-on-surface-variant w-24 flex-shrink-0">
              {t('profile.language_label')}
            </span>
            <select
              className="flex-1 text-sm text-on-surface bg-transparent focus:outline-none"
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Profile completeness + edit */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold tracking-widest uppercase text-tertiary">
              {t('profile.completeness_section')}
            </p>
            <span className="text-xs font-medium text-on-surface-variant">
              {completedCount}/5
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e6e9e8' }}>
            {sections.map((section, i) => (
              <button
                key={section.key}
                onClick={() => navigate(section.path)}
                className="w-full px-4 py-4 bg-white flex items-center gap-3 transition-all active:opacity-70 text-left"
                style={{ borderBottom: i < sections.length - 1 ? '1px solid #e6e9e8' : 'none' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={
                    section.complete
                      ? { backgroundColor: '#ceeacf' }
                      : { backgroundColor: '#f0f1f0', border: '1.5px solid #c3c8c0' }
                  }
                >
                  {section.complete && (
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: '#49624d', fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-on-surface">
                  {section.label}
                </span>
                <span className="material-symbols-outlined text-base text-outline">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <p className="text-xs font-bold tracking-widest uppercase text-tertiary mb-4">
            {t('profile.danger_section')}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#f5eeef', color: '#775259', border: '1px solid #e8d8da' }}
            >
              {t('profile.logout')}
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#fff8f8', color: '#93000a', border: '1px solid #ffdad6' }}
            >
              {t('profile.delete_account')}
            </button>
          </div>
        </section>

      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 48px)',
              maxWidth: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              zIndex: 61,
            }}
          >
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
              {t('profile.delete_confirm_title')}
            </h2>
            <p className="text-sm text-on-surface-variant mb-5">
              {t('profile.delete_confirm_body')}
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={e => setDeleteText(e.target.value)}
              placeholder={t('profile.delete_confirm_placeholder')}
              className="w-full rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none mb-4"
              style={{ backgroundColor: '#f8faf9', border: '2px solid #e1e3e2' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteText('') }}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ backgroundColor: '#eceeed', color: '#3f4946' }}
              >
                {t('profile.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'delete my account' || deleting}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: '#93000a', color: '#ffffff' }}
              >
                {deleting ? '...' : t('profile.delete_confirm_button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
