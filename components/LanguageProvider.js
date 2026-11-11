'use client'
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import { translations } from '../lib/translations'

const LanguageContext = createContext()

const KEY = 'dwarsing-lang'
const listeners = new Set()
let override = null // keeps the choice for this visit even if the browser blocks localStorage

function subscribe(cb) {
  listeners.add(cb)
  window.addEventListener('storage', cb) // another tab changed the language
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

function getSnapshot() {
  if (override) return override
  try {
    const v = localStorage.getItem(KEY)
    return v === 'mr' || v === 'en' ? v : 'en'
  } catch {
    return 'en'
  }
}

// The server (and the first paint while hydrating) always uses English, so server and
// browser HTML match; React then switches to the saved language without a hydration error.
const getServerSnapshot = () => 'en'

export function LanguageProvider({ children }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = lang === 'mr' ? 'mr' : 'en'
  }, [lang])

  function switchLanguage(newLang) {
    if (newLang !== 'en' && newLang !== 'mr') return
    override = newLang
    try { localStorage.setItem(KEY, newLang) } catch {}
    listeners.forEach(l => l())
  }

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}