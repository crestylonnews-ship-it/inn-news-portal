'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: '首頁' },
  { href: '/tags', label: '標籤分類' },
  { href: '/timeline', label: '時間線歸檔' },
  { href: '/opinion', label: '社論與評論' },
  { href: '/about', label: '關於本網' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#0a0b0f]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-5 lg:py-2">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="INN NEWS 首頁">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,191,255,0.4)]">
            <span className="text-lg font-bold text-cyan-400">⬢</span>
          </div>
          <div>
            <span className="font-orbitron text-base font-extrabold tracking-wider text-white text-glow sm:text-xl">INN NEWS</span>
            <span className="block text-[9px] tracking-[0.16em] text-cyan-400 sm:text-[10px]">星際聯邦官方新聞網</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full lg:order-none lg:flex-1 lg:mx-2 lg:max-w-xl" role="search">
          <div className="relative">
            <label htmlFor="site-search" className="sr-only">搜尋新聞</label>
            <input
              id="site-search"
              type="search"
              placeholder="搜尋新聞標題、內文或標籤..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-cyan-500/30 bg-[#121520] px-4 pr-11 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <button type="submit" aria-label="搜尋" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-cyan-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
              🔍
            </button>
          </div>
        </form>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-lg border border-cyan-500/30 px-3 py-2 text-sm text-cyan-300 transition-colors hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className="mr-2">{menuOpen ? '✕' : '☰'}</span>
          選單
        </button>

        <nav className="hidden shrink-0 items-center gap-4 xl:gap-6 lg:flex" aria-label="主選單">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-gray-300 transition-colors hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-sm">
              {item.label}
            </Link>
          ))}
        </nav>

        {menuOpen && (
          <nav id="mobile-navigation" className="order-4 grid w-full grid-cols-2 gap-2 border-t border-cyan-500/15 pt-3 lg:hidden" aria-label="手機主選單">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-sm text-gray-200 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
