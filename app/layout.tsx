import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/BilingualText';

export const metadata: Metadata = {
  title: 'INN 星際聯邦官方新聞網 | Stellar Federation Official News Network',
  description: 'INN 星際聯邦官方新聞網。Stellar Federation Official News Network.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#0a0b0f] text-white antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
