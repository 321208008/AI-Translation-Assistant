"use client"

import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AdSense } from '@/components/adsense';
import { Toaster } from '@/components/ui/toaster';
import { useI18n } from '@/lib/i18n/use-translations';
import { useEffect } from 'react';
import { LanguageProvider } from './language-provider';

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language } = useI18n();

  // 动态更新标题
  useEffect(() => {
    document.title = t('appName');
    document.documentElement.lang = language;
  }, [t, language]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <div className="min-h-screen flex flex-col">
          <AdSense />
          <Header />
          <main className="container mx-auto px-4 py-8 flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
} 