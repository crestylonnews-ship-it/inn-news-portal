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

export type PanelLanguage = ReadingLanguage | 'bilingual';

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

/** Used only before a visitor saves a preference. The setting dialog itself is bilingual in this case. */
export const DEFAULT_READING_LOCALE: ReadingLocale = { region: 'global', language: 'en' };

const COUNTRY_LOCALE_GROUPS: Array<{ countries: string[]; locale: ReadingLocale }> = [
  { countries: ['TW', 'HK', 'MO'], locale: { region: 'taiwan', language: 'zh-Hant' } },
  { countries: ['CN'], locale: { region: 'east-asia', language: 'zh-Hant' } },
  { countries: ['JP'], locale: { region: 'east-asia', language: 'ja' } },
  { countries: ['KR', 'KP'], locale: { region: 'east-asia', language: 'ko' } },
  { countries: ['TH'], locale: { region: 'southeast-asia', language: 'th' } },
  { countries: ['VN'], locale: { region: 'southeast-asia', language: 'vi' } },
  { countries: ['ID'], locale: { region: 'southeast-asia', language: 'id' } },
  { countries: ['MY', 'BN'], locale: { region: 'southeast-asia', language: 'ms' } },
  { countries: ['SG', 'PH', 'KH', 'LA', 'MM', 'TL'], locale: { region: 'southeast-asia', language: 'en' } },
  { countries: ['IN'], locale: { region: 'south-asia', language: 'hi' } },
  { countries: ['BD'], locale: { region: 'south-asia', language: 'bn' } },
  { countries: ['PK', 'LK', 'NP', 'BT', 'MV', 'AF'], locale: { region: 'south-asia', language: 'en' } },
  { countries: ['TR'], locale: { region: 'middle-east', language: 'tr' } },
  { countries: ['AE', 'BH', 'DZ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA', 'OM', 'PS', 'QA', 'SA', 'SD', 'SY', 'TN', 'YE'], locale: { region: 'middle-east', language: 'ar' } },
  { countries: ['FR', 'BE', 'CH', 'LU', 'MC'], locale: { region: 'europe', language: 'fr' } },
  { countries: ['DE', 'AT', 'LI'], locale: { region: 'europe', language: 'de' } },
  { countries: ['ES', 'AD'], locale: { region: 'europe', language: 'es' } },
  { countries: ['PT'], locale: { region: 'europe', language: 'pt' } },
  { countries: ['RU', 'BY'], locale: { region: 'europe', language: 'ru' } },
  { countries: ['UA'], locale: { region: 'europe', language: 'uk' } },
  { countries: ['IT', 'SM', 'VA'], locale: { region: 'europe', language: 'it' } },
  { countries: ['NL'], locale: { region: 'europe', language: 'nl' } },
  { countries: ['PL'], locale: { region: 'europe', language: 'pl' } },
  { countries: ['GB', 'IE', 'DK', 'FI', 'IS', 'NO', 'SE', 'EE', 'LV', 'LT', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'XK', 'MD', 'MT', 'CY'], locale: { region: 'europe', language: 'en' } },
  { countries: ['MX', 'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE'], locale: { region: 'latin-america', language: 'es' } },
  { countries: ['BR'], locale: { region: 'latin-america', language: 'pt' } },
  { countries: ['US', 'CA'], locale: { region: 'north-america', language: 'en' } },
  { countries: ['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'WS', 'TO', 'TV', 'KI', 'NR', 'FM', 'MH', 'PW'], locale: { region: 'oceania', language: 'en' } },
  { countries: ['AO', 'CV', 'GW', 'MZ', 'ST'], locale: { region: 'africa', language: 'pt' } },
  { countries: ['BJ', 'BF', 'BI', 'CD', 'CF', 'CG', 'CI', 'CM', 'DJ', 'GA', 'GN', 'GQ', 'KM', 'MG', 'ML', 'NE', 'RW', 'SC', 'SN', 'TD', 'TG'], locale: { region: 'africa', language: 'fr' } },
  { countries: ['ZA', 'NG', 'KE', 'GH', 'TZ', 'UG', 'ZW', 'ZM', 'MW', 'BW', 'NA', 'LS', 'SZ', 'LR', 'SL', 'GM', 'MU'], locale: { region: 'africa', language: 'en' } },
];

export function readingLocaleFromCountry(countryCode: string | null | undefined): ReadingLocale | null {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized || !/^[A-Z]{2}$/.test(normalized)) return null;
  const match = COUNTRY_LOCALE_GROUPS.find(group => group.countries.includes(normalized));
  return match ? { ...match.locale } : { region: 'global', language: 'en' };
}

export function readingLanguageLabel(language: ReadingLanguage, displayLanguage: 'zh' | 'en' = 'zh'): string {
  const match = READING_LANGUAGES.find(item => item.code === language);
  return match ? (displayLanguage === 'zh' ? match.zh : match.en) : language;
}

export function readingLanguageNativeName(language: ReadingLanguage): string {
  return READING_LANGUAGES.find(item => item.code === language)?.native || language;
}
