'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type SiteLanguage = 'zh' | 'en';

// 保留既有版面 API，但不使用 React Context／Hooks，讓靜態匯出可在伺服器端穩定預渲染。
export function LanguageProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useLanguage() {
  const [language, setLanguageState] = useState<SiteLanguage>('zh');

  useEffect(() => {
    const readLanguage = () => setLanguageState(document.documentElement.dataset.language === 'en' ? 'en' : 'zh');
    readLanguage();
    window.addEventListener('inn-language-change', readLanguage);
    return () => window.removeEventListener('inn-language-change', readLanguage);
  }, []);

  const setLanguage = (nextLanguage: SiteLanguage) => {
    document.documentElement.dataset.language = nextLanguage;
    window.localStorage.setItem('inn-language', nextLanguage);
    window.dispatchEvent(new Event('inn-language-change'));
  };

  return { language, setLanguage, toggleLanguage: () => setLanguage(language === 'zh' ? 'en' : 'zh') };
}

interface BilingualTextProps {
  zh: ReactNode;
  en: ReactNode;
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
  secondaryClassName = '',
  block = false,
}: BilingualTextProps) {
  return (
    <span className={`${block ? 'block' : 'inline-block'} bilingual-text bilingual-pair ${className}`}>
      <span className={`bilingual-language-zh bilingual-primary ${primaryClassName}`}>{zh}</span>
      <span className={`bilingual-language-en bilingual-secondary ${primaryClassName} ${secondaryClassName}`}>{en}</span>
    </span>
  );
}

function splitMarkupBlocks(html: string): string[] {
  const value = String(html || '').trim();
  if (!value) return [];
  const pattern = /<(h[1-6]|p|blockquote|ul|ol|pre|table|hr)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<hr\s*\/?\s*>/gi;
  const blocks = value.match(pattern) || [];
  return blocks.length ? blocks : [value];
}

export function BilingualMarkup({ zhHtml, enHtml, className = '' }: { zhHtml: string; enHtml: string; className?: string }) {
  const zhBlocks = splitMarkupBlocks(zhHtml);
  const enBlocks = splitMarkupBlocks(enHtml);
  const blockCount = Math.max(zhBlocks.length, enBlocks.length);

  return (
    <div className={`bilingual-text bilingual-markup ${className}`}>
      {Array.from({ length: blockCount }, (_, index) => {
        const zhBlock = zhBlocks[index] || '';
        const enBlock = enBlocks[index] || '';
        return (
          <section className="bilingual-block" key={`bilingual-block-${index}`}>
            <div className="bilingual-language-zh bilingual-primary" dangerouslySetInnerHTML={{ __html: zhBlock }} />
            <div className="bilingual-language-en bilingual-secondary" dangerouslySetInnerHTML={{ __html: enBlock }} />
          </section>
        );
      })}
    </div>
  );
}

export function LanguageToggle() {
  const toggleLanguage = () => {
    const root = document.documentElement;
    const current = root.dataset.language === 'en' ? 'en' : 'zh';
    const next = current === 'zh' ? 'en' : 'zh';
    root.dataset.language = next;
    window.localStorage.setItem('inn-language', next);
    window.dispatchEvent(new Event('inn-language-change'));
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="language-toggle rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-cyan-300 transition-all hover:border-cyan-300 hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      aria-label="切換中文或英文閱讀模式"
      title="Switch language"
    >
      <span className="bilingual-language-zh">EN / 英文主導</span>
      <span className="bilingual-language-en">中 / 中文主導</span>
    </button>
  );
}
