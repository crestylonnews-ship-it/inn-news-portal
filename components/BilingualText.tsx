'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SiteLanguage = 'zh' | 'en';

interface LanguageContextValue {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>('zh');

  useEffect(() => {
    const stored = window.localStorage.getItem('inn-language');
    if (stored === 'zh' || stored === 'en') setLanguageState(stored);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: nextLanguage => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem('inn-language', nextLanguage);
    },
    toggleLanguage: () => {
      const nextLanguage = language === 'zh' ? 'en' : 'zh';
      setLanguageState(nextLanguage);
      window.localStorage.setItem('inn-language', nextLanguage);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

interface BilingualTextProps {
  zh: React.ReactNode;
  en: React.ReactNode;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  block?: boolean;
}

export default function BilingualText({
  zh,
  en,
  className = '',
  primaryClassName = '',
  block = false,
}: BilingualTextProps) {
  const { language } = useLanguage();
  const primary = language === 'zh' ? zh : en;

  return (
    <span className={`${block ? 'block' : 'inline-block'} bilingual-text ${className}`}>
      <span className={`bilingual-primary ${primaryClassName}`}>{primary}</span>
    </span>
  );
}

export function BilingualMarkup({ zhHtml, enHtml, className = '' }: { zhHtml: string; enHtml: string; className?: string }) {
  const { language } = useLanguage();
  const primaryHtml = language === 'zh' ? zhHtml : enHtml;

  return (
    <div className={`bilingual-text bilingual-markup ${className}`}>
      <div className="bilingual-primary" dangerouslySetInnerHTML={{ __html: primaryHtml }} />
    </div>
  );
}

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="language-toggle rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-cyan-300 transition-all hover:border-cyan-300 hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      aria-label={language === 'zh' ? '切換為英文主導模式' : 'Switch to Chinese-primary mode'}
      title={language === 'zh' ? 'English primary' : '中文主導'}
    >
      {language === 'zh' ? 'EN / 英文主導' : '中 / 中文主導'}
    </button>
  );
}
