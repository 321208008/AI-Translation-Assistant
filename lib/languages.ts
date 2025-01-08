export interface Language {
  code: string;
  name: string;
  nativeName: string;
  category: string;
}

export const languages: Language[] = [
  // East Asian Languages
  { code: 'zh', name: 'Chinese', nativeName: '中文', category: 'East Asian' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', category: 'East Asian' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', category: 'East Asian' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', category: 'East Asian' },
  
  // European Languages
  { code: 'en', name: 'English', nativeName: 'English', category: 'European' },
  { code: 'fr', name: 'French', nativeName: 'Français', category: 'European' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', category: 'European' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', category: 'European' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', category: 'European' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', category: 'European' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', category: 'European' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', category: 'European' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', category: 'European' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', category: 'European' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', category: 'European' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', category: 'European' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', category: 'European' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', category: 'European' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', category: 'European' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', category: 'European' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', category: 'European' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', category: 'European' },
  
  // South Asian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', category: 'South Asian' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', category: 'South Asian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', category: 'South Asian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', category: 'South Asian' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', category: 'South Asian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', category: 'South Asian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', category: 'South Asian' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', category: 'South Asian' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', category: 'South Asian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', category: 'South Asian' },
  
  // Southeast Asian Languages
  { code: 'th', name: 'Thai', nativeName: 'ไทย', category: 'Southeast Asian' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', category: 'Southeast Asian' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', category: 'Southeast Asian' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', category: 'Southeast Asian' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', category: 'Southeast Asian' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', category: 'Southeast Asian' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', category: 'Southeast Asian' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', category: 'Southeast Asian' },
  
  // Middle Eastern Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', category: 'Middle Eastern' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', category: 'Middle Eastern' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', category: 'Middle Eastern' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', category: 'Middle Eastern' }
];

export const getLanguageCategories = (): string[] => {
  const categories = new Set(languages.map(lang => lang.category));
  return Array.from(categories);
};

export const getLanguagesByCategory = (category: string): Language[] => {
  return languages.filter(lang => lang.category === category);
};

export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(lang => lang.code === code);
};

export const getLanguageNameByCode = (code: string): string => {
  const language = getLanguageByCode(code);
  return language ? language.name : code;
};