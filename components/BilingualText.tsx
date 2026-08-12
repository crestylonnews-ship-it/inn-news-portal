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

type BilingualBlockPair = { zh: string; en: string; kind: 'title' | 'excerpt' | 'body' | 'sources' };

function isTag(block: string, tag: string): boolean {
  return new RegExp(`^<${tag}(?:\\s|>)`, 'i').test(block.trim());
}

function isSourceHeading(block: string): boolean {
  return isTag(block, 'h1') || isTag(block, 'h2') || isTag(block, 'h3') || isTag(block, 'h4')
    ? /來源整理|資料來源|sources?|citations?/i.test(block.replace(/<[^>]+>/g, ' '))
    : false;
}

function splitSourceSection(blocks: string[]): { content: string[]; sources: string[] } {
  const sourceIndex = blocks.findIndex(isSourceHeading);
  return sourceIndex === -1
    ? { content: blocks, sources: [] }
    : { content: blocks.slice(0, sourceIndex), sources: blocks.slice(sourceIndex) };
}

function takeLeading(blocks: string[], matcher: (block: string) => boolean): { leading: string; remaining: string[] } {
  if (blocks.length && matcher(blocks[0])) return { leading: blocks[0], remaining: blocks.slice(1) };
  return { leading: '', remaining: blocks };
}

function groupBlocks(blocks: string[], groupCount: number): string[] {
  if (!blocks.length || groupCount <= 0) return [];
  const groups: string[] = [];
  let cursor = 0;
  for (let group = 0; group < groupCount && cursor < blocks.length; group += 1) {
    const remainingBlocks = blocks.length - cursor;
    const remainingGroups = groupCount - group;
    const take = Math.max(1, Math.ceil(remainingBlocks / remainingGroups));
    groups.push(blocks.slice(cursor, cursor + take).join('\n'));
    cursor += take;
  }
  return groups;
}

function alignMarkupBlocks(zhHtml: string, enHtml: string): BilingualBlockPair[] {
  const zhSections = splitSourceSection(splitMarkupBlocks(zhHtml));
  const enSections = splitSourceSection(splitMarkupBlocks(enHtml));
  const pairs: BilingualBlockPair[] = [];

  const zhTitle = takeLeading(zhSections.content, block => /^<h[1-6](?:\s|>)/i.test(block.trim()));
  const enTitle = takeLeading(enSections.content, block => /^<h[1-6](?:\s|>)/i.test(block.trim()));
  if (zhTitle.leading || enTitle.leading) pairs.push({ zh: zhTitle.leading, en: enTitle.leading, kind: 'title' });

  const zhExcerpt = takeLeading(zhTitle.remaining, block => isTag(block, 'blockquote'));
  const enExcerpt = takeLeading(enTitle.remaining, block => isTag(block, 'blockquote'));
  if (zhExcerpt.leading || enExcerpt.leading) pairs.push({ zh: zhExcerpt.leading, en: enExcerpt.leading, kind: 'excerpt' });

  const pairCount = Math.max(1, Math.min(zhExcerpt.remaining.length || 1, enExcerpt.remaining.length || 1));
  const zhBodyGroups = groupBlocks(zhExcerpt.remaining, pairCount);
  const enBodyGroups = groupBlocks(enExcerpt.remaining, pairCount);
  const bodyCount = Math.max(zhBodyGroups.length, enBodyGroups.length);
  for (let index = 0; index < bodyCount; index += 1) {
    pairs.push({ zh: zhBodyGroups[index] || '', en: enBodyGroups[index] || '', kind: 'body' });
  }

  if (zhSections.sources.length || enSections.sources.length) {
    pairs.push({ zh: zhSections.sources.join('\n'), en: enSections.sources.join('\n'), kind: 'sources' });
  }
  return pairs;
}

export function BilingualMarkup({ zhHtml, enHtml, className = '' }: { zhHtml: string; enHtml: string; className?: string }) {
  const blocks = alignMarkupBlocks(zhHtml, enHtml);

  return (
    <div className={`bilingual-text bilingual-markup ${className}`}>
      {blocks.map((block, index) => {
        return (
          <section className={`bilingual-block bilingual-block--${block.kind}`} key={`bilingual-block-${index}`}>
            <div className="bilingual-language-zh bilingual-primary" dangerouslySetInnerHTML={{ __html: block.zh }} />
            <div className="bilingual-language-en bilingual-secondary" dangerouslySetInnerHTML={{ __html: block.en }} />
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
