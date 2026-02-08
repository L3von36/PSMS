"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, Locale, TranslationKey } from "./translations"

type I18nContextType = {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en')

    useEffect(() => {
        const saved = localStorage.getItem('psms-locale') as Locale
        if (saved && (saved === 'en' || saved === 'am')) {
            setLocale(saved)
        }
    }, [])

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale)
        localStorage.setItem('psms-locale', newLocale)
    }

    const t = (key: TranslationKey) => {
        return translations[locale][key] || key
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) throw new Error("useI18n must be used within I18nProvider")
    return context
}
