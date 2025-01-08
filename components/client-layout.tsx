"use client"

import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Toaster } from '@/components/ui/toaster';

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        {children}
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
} 