"use client"

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n/use-translations'

export function LanguageProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return null
  }

  return <>{children}</>
} 