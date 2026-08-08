import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INN 星際聯邦官方新聞網',
  description: '銀河系最炫技的高科技新聞終端',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-[#0a0b0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
