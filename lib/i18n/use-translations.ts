"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations } from './translations'

type Language = 'en' | 'zh'

// 获取浏览器语言并匹配支持的语言
const getBrowserLanguage = (): Language => {
  // 在服务器端或者window未定义时返回默认语言
  if (typeof window === 'undefined') return 'en'
  
  try {
    // 尝试从 localStorage 获取已保存的语言设置
    const savedLanguage = window.localStorage.getItem('language-storage')
    if (savedLanguage) {
      const parsed = JSON.parse(savedLanguage)
      if (parsed.state && parsed.state.language) {
        return parsed.state.language
      }
    }
    
    const browserLang = window.navigator.language.toLowerCase()
    
    // 检查是否为中文
    if (browserLang.startsWith('zh')) {
      return 'zh'
    }
  } catch (e) {
    console.error('Error getting browser language:', e)
  }
  
  // 默认返回英文
  return 'en'
}

interface I18nStore {
  language: Language
  t: (key: string) => string
  setLanguage: (language: Language) => void
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: getBrowserLanguage(),
      t: (key: string) => {
        const state = get()
        const keys = key.split('.')
        let value: any = translations[state.language]
        
        for (const k of keys) {
          value = value?.[k]
        }
        
        return value || key
      },
      setLanguage: (language: Language) => set({ language })
    }),
    {
      name: 'language-storage',
    }
  )
)