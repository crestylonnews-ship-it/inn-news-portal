import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/BilingualText';
import StellarField from '@/components/StellarField';
import { ReadingLocaleProvider } from '@/components/ReadingLocaleProvider';

export const metadata: Metadata = {
  title: 'INN 星際聯邦官方新聞網 | Stellar Federation Official News Network',
  description: 'INN 星際聯邦官方新聞網。Stellar Federation Official News Network.',
};

const languageBootstrapScript = `
  try {
    const readingLocale = JSON.parse(window.localStorage.getItem('inn-reading-locale') || 'null');
    const legacyLanguage = window.localStorage.getItem('inn-language');
    // The new primary layer is authoritative. A legacy locale only held a
    // translation target, so it is migrated deterministically on first load.
    const primary = readingLocale?.primaryLanguage === 'en' || readingLocale?.primaryLanguage === 'zh'
      ? readingLocale.primaryLanguage
      : readingLocale?.language === 'en' ? 'en' : readingLocale?.language ? 'zh' : legacyLanguage === 'en' ? 'en' : 'zh';
    document.documentElement.dataset.language = primary;
  } catch (_) {
    document.documentElement.dataset.language = 'zh';
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" data-language="zh" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageBootstrapScript }} />
        <style>{`
          /* Both languages remain visible. Article CSS chooses the leading
             language and the companion's smaller reading hierarchy. */
          .bilingual-language-zh, .bilingual-language-en { min-width: 0; }
        `}</style>
      </head>
      <body className="bg-[#0a0b0f] text-white antialiased">
        <StellarField />
        <LanguageProvider><ReadingLocaleProvider>{children}</ReadingLocaleProvider></LanguageProvider>
      </body>
    </html>
  );
}
