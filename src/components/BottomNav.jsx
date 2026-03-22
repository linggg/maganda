import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const navItems = [
  { path: '/home',    icon: 'home',              labelKey: 'nav.home'     },
  { path: '/check',   icon: 'document_scanner',  labelKey: 'nav.check'    },
  { path: '/insights',icon: 'analytics',         labelKey: 'nav.insights' },
  { path: '/saved',   icon: 'bookmark',          labelKey: 'nav.saved'    },
  { path: '/profile', icon: 'person',            labelKey: 'nav.profile'  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-background/90 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(25,28,28,0.04)] rounded-t-[2rem]">
      {navItems.map((item) => {
        const isActive = item.path === '/profile'
          ? location.pathname.startsWith('/profile')
          : location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-200 ${
              isActive
                ? 'bg-primary text-on-primary rounded-full'
                : 'text-outline hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-label text-[11px] font-medium tracking-wide uppercase">
              {t(item.labelKey)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
