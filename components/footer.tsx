import { Github, Twitter, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/use-translations'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useI18n()

  return (
    <footer className="w-full border-t py-6 md:py-8">
      <div className="container px-4 mx-auto flex flex-col items-center justify-center gap-4 md:gap-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-10 md:w-10">
            <a
              href="https://github.com/321208008"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4 md:h-5 md:w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-10 md:w-10">
            <a
              href="https://twitter.com/zyailive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4 md:h-5 md:w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-10 md:w-10">
            <a
              href="https://itusi.cn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
            >
              <Globe className="h-4 w-4 md:h-5 md:w-5" />
            </a>
          </Button>
        </div>
        <div className="text-xs md:text-sm text-muted-foreground text-center px-4">
          © {currentYear} {t('appName')}. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 