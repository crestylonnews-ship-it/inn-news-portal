'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BilingualText, { LanguageToggle, useLanguage } from '@/components/BilingualText';

const navItems = [
  { href: '/', zh: '首頁', en: 'HOME' },
  { href: '/tags', zh: '標籤分類', en: 'TAGS' },
  { href: '/timeline', zh: '時間線歸檔', en: 'TIMELINE' },
  { href: '/map-test', zh: '地圖測試', en: 'MAP TEST' },
  { href: '/opinion', zh: '社論與評論', en: 'OPINION' },
  { href: '/about', zh: '關於本網', en: 'ABOUT' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="site-nav sticky top-0 z-50 border-b border-cyan-500/20 bg-[#0a0b0f]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-5 lg:py-2">
        <Link href="/" className="nav-brand group flex shrink-0 items-center gap-2.5" aria-label="INN NEWS 首頁 / Home">
          <div>
            <span className="block font-orbitron text-base font-extrabold tracking-wider text-white text-glow sm:text-xl">INN NEWS</span>
            <BilingualText zh="星際聯邦官方新聞網" en="Stellar Federation News Network" primaryClassName="text-cyan-300" secondaryClassName="text-cyan-500/70" />
          </div>
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full lg:order-none lg:flex-1 lg:mx-2 lg:max-w-xl" role="search">
          <div className="relative">
            <label htmlFor="site-search" className="sr-only">搜尋新聞</label>
            <input
              id="site-search"
              type="search"
              placeholder={language === 'zh' ? '搜尋新聞標題、內文或標籤...' : 'Search headlines, articles or tags...'}
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-cyan-500/30 bg-[#121520] px-4 pr-11 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <button type="submit" aria-label={language === 'zh' ? '搜尋' : 'Search'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-cyan-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
              <BilingualText zh="搜尋" en="SEARCH" />
            </button>
          </div>
        </form>

        <LanguageToggle />

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-lg border border-cyan-500/30 px-3 py-2 text-sm text-cyan-300 transition-colors hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(open => !open)}
        >
          <BilingualText zh={`選單${menuOpen ? '（關閉）' : ''}`} en={`MENU${menuOpen ? ' (CLOSE)' : ''}`} />
        </button>

        <nav className="hidden shrink-0 items-center gap-4 xl:gap-6 lg:flex" aria-label="主選單">
          {navItems.map(item => (
                          <Link key={item.href} href={item.href} className="nav-link whitespace-nowrap rounded-sm text-sm font-medium text-gray-300 transition-colors hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
                <BilingualText zh={item.zh} en={item.en} />
              </Link>

          ))}
        </nav>

        {menuOpen && (
          <nav id="mobile-navigation" className="order-4 grid w-full grid-cols-2 gap-2 border-t border-cyan-500/15 pt-3 lg:hidden" aria-label="手機主選單">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-sm text-gray-200 transition-colors hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300">
                <BilingualText zh={item.zh} en={item.en} />
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
