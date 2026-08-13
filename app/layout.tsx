import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/BilingualText';

export const metadata: Metadata = {
  title: 'INN 星際聯邦官方新聞網 | Stellar Federation Official News Network',
  description: 'INN 星際聯邦官方新聞網。Stellar Federation Official News Network.',
};

const languageBootstrapScript = `
  try {
    const stored = window.localStorage.getItem('inn-language');
    document.documentElement.dataset.language = stored === 'en' ? 'en' : 'zh';
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
