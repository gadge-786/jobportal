'use client'
import { createContext, useContext, useState } from 'react'
import { translations } from '../lib/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dwarsing-lang') || 'en'
  }
  return 'en'
})

  function switchLanguage(newLang) {
    setLang(newLang)
    localStorage.setItem('dwarsing-lang', newLang)
  }

  const t = (key) => translations[lang][key] || translations.en[key] || key

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}