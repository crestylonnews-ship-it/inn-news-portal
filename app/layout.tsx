import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import StarfieldCanvas from '@/components/StarfieldCanvas';

export const metadata: Metadata = {
  title: 'INN 星際新聞網',
  description: '銀河系最炫技的新聞終端',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <StarfieldCanvas />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
