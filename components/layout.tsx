import { Languages, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/use-translations'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 mr-4">
            <div className="relative">
              <Languages className="w-6 h-6 text-primary" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="font-semibold">{t('appName')}</span>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
} 