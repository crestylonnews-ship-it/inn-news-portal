import type { ReadingLanguage } from '@/lib/local-translation';

export type ReadingRegion =
  | 'taiwan'
  | 'east-asia'
  | 'southeast-asia'
  | 'south-asia'
  | 'middle-east'
  | 'europe'
  | 'africa'
  | 'north-america'
  | 'latin-america'
  | 'oceania'
  | 'global';

export type ReadingLocale = {
  region: ReadingRegion;
  language: ReadingLanguage;
};

export const READING_LANGUAGES: Array<{
  code: ReadingLanguage;
  zh: string;
  en: string;
  native: string;
}> = [
  { code: 'zh-Hant', zh: '繁體中文', en: 'Traditional Chinese', native: '繁體中文' },
  { code: 'en', zh: '英文', en: 'English', native: 'English' },
  { code: 'ja', zh: '日語', en: 'Japanese', native: '日本語' },
  { code: 'ko', zh: '韓語', en: 'Korean', native: '한국어' },
  { code: 'th', zh: '泰語', en: 'Thai', native: 'ไทย' },
  { code: 'vi', zh: '越南語', en: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', zh: '印尼語', en: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', zh: '馬來語', en: 'Malay', native: 'Bahasa Melayu' },
  { code: 'ar', zh: '阿拉伯語', en: 'Arabic', native: 'العربية' },
  { code: 'hi', zh: '印地語', en: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', zh: '孟加拉語', en: 'Bengali', native: 'বাংলা' },
  { code: 'fr', zh: '法語', en: 'French', native: 'Français' },
  { code: 'de', zh: '德語', en: 'German', native: 'Deutsch' },
  { code: 'es', zh: '西班牙語', en: 'Spanish', native: 'Español' },
  { code: 'pt', zh: '葡萄牙語', en: 'Portuguese', native: 'Português' },
  { code: 'ru', zh: '俄語', en: 'Russian', native: 'Русский' },
  { code: 'it', zh: '義大利語', en: 'Italian', native: 'Italiano' },
  { code: 'nl', zh: '荷蘭語', en: 'Dutch', native: 'Nederlands' },
  { code: 'pl', zh: '波蘭語', en: 'Polish', native: 'Polski' },
  { code: 'tr', zh: '土耳其語', en: 'Turkish', native: 'Türkçe' },
  { code: 'uk', zh: '烏克蘭語', en: 'Ukrainian', native: 'Українська' },
];

export const READING_REGIONS: Array<{
  code: ReadingRegion;
  zh: string;
  en: string;
  defaultLanguage: ReadingLanguage;
}> = [
  { code: 'taiwan', zh: '臺灣／繁體中文使用地區', en: 'Taiwan / Traditional Chinese regions', defaultLanguage: 'zh-Hant' },
  { code: 'east-asia', zh: '東北亞', en: 'Northeast Asia', defaultLanguage: 'ja' },
  { code: 'southeast-asia', zh: '東南亞', en: 'Southeast Asia', defaultLanguage: 'id' },
  { code: 'south-asia', zh: '南亞', en: 'South Asia', defaultLanguage: 'hi' },
  { code: 'middle-east', zh: '中東與北非', en: 'Middle East & North Africa', defaultLanguage: 'ar' },
  { code: 'europe', zh: '歐洲', en: 'Europe', defaultLanguage: 'en' },
  { code: 'africa', zh: '撒哈拉以南非洲', en: 'Sub-Saharan Africa', defaultLanguage: 'en' },
  { code: 'north-america', zh: '北美', en: 'North America', defaultLanguage: 'en' },
  { code: 'latin-america', zh: '拉丁美洲', en: 'Latin America', defaultLanguage: 'es' },
  { code: 'oceania', zh: '大洋洲', en: 'Oceania', defaultLanguage: 'en' },
  { code: 'global', zh: '不依所在地區', en: 'No regional preference', defaultLanguage: 'en' },
];

export const DEFAULT_READING_LOCALE: ReadingLocale = { region: 'taiwan', language: 'zh-Hant' };

export function readingLanguageLabel(language: ReadingLanguage, displayLanguage: 'zh' | 'en' = 'zh'): string {
  const match = READING_LANGUAGES.find(item => item.code === language);
  return match ? (displayLanguage === 'zh' ? match.zh : match.en) : language;
}

export function readingLanguageNativeName(language: ReadingLanguage): string {
  return READING_LANGUAGES.find(item => item.code === language)?.native || language;
}
