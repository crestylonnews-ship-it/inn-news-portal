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

export function splitMarkupBlocks(html: string): string[] {
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
  if (!(isTag(block, 'h1') || isTag(block, 'h2') || isTag(block, 'h3') || isTag(block, 'h4'))) return false;

  const headingText = block
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Match standalone source-section headings only. A broad substring match
  // would incorrectly classify English headlines containing "resources".
  return /^(?:來源整理|資料來源(?:與引用)?|sources?(?:\s+(?:compilation|summary)|\s+(?:&|and)\s+citations?)?|citations?)[:：]?$/i.test(headingText);
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

export function alignMarkupBlocks(zhHtml: string, enHtml: string): BilingualBlockPair[] {
  const zhSections = splitSourceSection(splitMarkupBlocks(zhHtml));
  const enSections = splitSourceSection(splitMarkupBlocks(enHtml));
  const pairs: BilingualBlockPair[] = [];

  const zhTitle = takeLeading(zhSections.content, block => /^<h[1-6](?:\s|>)/i.test(block.trim()));
  const enTitle = takeLeading(enSections.content, block => /^<h[1-6](?:\s|>)/i.test(block.trim()));
  if (zhTitle.leading || enTitle.leading) pairs.push({ zh: zhTitle.leading, en: enTitle.leading, kind: 'title' });

  const zhExcerpt = takeLeading(zhTitle.remaining, block => isTag(block, 'blockquote'));
  const enExcerpt = takeLeading(enTitle.remaining, block => isTag(block, 'blockquote'));
  if (zhExcerpt.leading || enExcerpt.leading) pairs.push({ zh: zhExcerpt.leading, en: enExcerpt.leading, kind: 'excerpt' });

  // 嚴格維持每一個 Markdown 區塊的索引。若資料異常，保留空白的另一側
  // 讓測試與渲染都能看見差異，而非將多段合併以偽造一對一配對。
  const bodyCount = Math.max(zhExcerpt.remaining.length, enExcerpt.remaining.length);
  for (let index = 0; index < bodyCount; index += 1) {
    pairs.push({ zh: zhExcerpt.remaining[index] || '', en: enExcerpt.remaining[index] || '', kind: 'body' });
  }

  if (zhSections.sources.length || enSections.sources.length) {
    pairs.push({ zh: zhSections.sources.join('\n'), en: enSections.sources.join('\n'), kind: 'sources' });
  }
  return pairs;
}

export function BilingualMarkup({ zhHtml, enHtml, className = '' }: { zhHtml: string; enHtml: string; className?: string }) {
  const blocks = alignMarkupBlocks(zhHtml, enHtml);

  return (
    <div className={`bilingual-text bilingual-markup bilingual-markup--interleaved ${className}`} data-bilingual-order="zh-en">
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
  const { language, toggleLanguage } = useLanguage();
  const nextLabel = language === 'zh' ? 'EN' : '中文';
  const nextDescription = language === 'zh' ? '英文主導' : '中文主導';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="language-toggle"
      aria-label="切換中文或英文閱讀模式"
      title="Switch language"
    >
      <span className="language-toggle-code">{nextLabel}</span>
      <span className="language-toggle-copy">{nextDescription}</span>
    </button>
  );
}
