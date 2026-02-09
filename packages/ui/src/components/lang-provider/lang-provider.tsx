'use client'

import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import type { SupportedLanguage } from '../../lib/types'

type LangProviderProps = {
  defaultLanguage?: SupportedLanguage
  supportedLanguages?: SupportedLanguage[]
}

export function LangProvider({
  defaultLanguage = 'en',
  supportedLanguages = ['en', 'fr'],
}: LangProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Extract language from pathname - matches /en, /fr, /en/, /fr/, etc.
    const langMatch = /^\/([a-z]{2})(?:\/|$)/.exec(pathname)
    const lang =
      langMatch && supportedLanguages.includes(langMatch[1] as SupportedLanguage)
        ? (langMatch[1] as SupportedLanguage)
        : defaultLanguage

    // Update the HTML lang attribute
    document.documentElement.setAttribute('lang', lang)
  }, [pathname, defaultLanguage, supportedLanguages])

  return null
}
