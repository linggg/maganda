import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en/common.json'
import vi from '../locales/vi/common.json'
import ms from '../locales/ms/common.json'
import th from '../locales/th/common.json'
import ko from '../locales/ko/common.json'
import fil from '../locales/fil/common.json'
import zh from '../locales/zh/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      vi: { common: vi },
      ms: { common: ms },
      th: { common: th },
      ko: { common: ko },
      fil: { common: fil },
      zh: { common: zh },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n