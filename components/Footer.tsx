import Link from 'next/link';

const footerLinks = [
  { href: '/tags', label: '標籤分類' },
  { href: '/timeline', label: '時間線歸檔' },
  { href: '/opinion', label: '社論與評論' },
];

export default function Footer() {
  return (
    <footer className="site-footer mt-20 border-t border-cyan-500/20 bg-[#080b12]">
      <div className="site-footer-inner mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end md:py-12">
        <div className="space-y-3">
          <p className="footer-brand font-orbitron text-sm font-bold tracking-[0.18em] text-cyan-300 sm:text-base">INN 星際聯邦官方新聞網</p>
          <p className="max-w-xl text-sm leading-7 text-slate-500">Stellar Federation Official News Network · 以清晰、可讀與可追溯的方式傳遞每一則報導。</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">CHANNEL STATUS // ARCHIVE ONLINE · 2026</p>
        </div>
        <nav className="footer-links flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="頁尾導覽">
          {footerLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-400 transition-colors hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="footer-baseline border-t border-white/[0.04] px-4 py-3 text-center font-mono text-[10px] tracking-[0.16em] text-slate-600 sm:px-6">
        © 2026 INN NEWS · ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}
