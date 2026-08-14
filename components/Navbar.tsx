'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LanguageToggle, useLanguage } from '@/components/BilingualText';

const navItems = [
  { href: '/', zh: '新聞首頁', en: 'NEWS HOME' },
  { href: '/map-test', zh: '地圖測試', en: 'MAP LAB' },
  { href: '/tags', zh: '主題索引', en: 'TOPIC INDEX' },
  { href: '/timeline', zh: '時事時間線', en: 'CURRENT TIMELINE' },
  { href: '/opinion', zh: '社論與評論', en: 'OPINION' },
  { href: '/about', zh: '關於本網', en: 'ABOUT' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) window.location.assign(`/search?q=${encodeURIComponent(query)}`);
  };

  const searchLabel = language === 'zh' ? '搜尋' : 'SEARCH';

  return (
    <header className="site-nav">
      <div className="nav-frame">
        <div className="nav-brand-cluster">
          <Link href="/" className="nav-brand" aria-label="INN NEWS 首頁 / Home">
            <span className="nav-brand-name">INN NEWS</span>
            <span className="nav-brand-subtitle nav-brand-subtitle-zh">星際聯邦官方新聞網</span>
            <span className="nav-brand-subtitle nav-brand-subtitle-en">Stellar Federation News Network</span>
            <span className="nav-choice-tagline">空間及索引，把選擇權還給你</span>
          </Link>
          <Link href="/acknowledgements" className="nav-acknowledgements-link" aria-label={language === 'zh' ? '前往特別感謝' : 'Open acknowledgements'}>
            <span>{language === 'zh' ? '特別感謝' : 'ACKNOWLEDGEMENTS'}</span>
            <i aria-hidden="true">↗</i>
          </Link>
        </div>

        <div className="nav-controls">
          <form onSubmit={handleSearch} className="nav-search" role="search">
            <label htmlFor="site-search" className="sr-only">搜尋新聞</label>
            <input
              id="site-search"
              type="search"
              placeholder={language === 'zh' ? '搜尋新聞、標籤…' : 'Search news…'}
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
            <button type="submit" aria-label={searchLabel}>{searchLabel}</button>
          </form>
          <LanguageToggle />
          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? (language === 'zh' ? '關閉' : 'CLOSE') : (language === 'zh' ? '選單' : 'MENU')}
          </button>
        </div>

        <nav className="nav-desktop" aria-label="主選單">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="nav-link">
              {language === 'zh' ? item.zh : item.en}
            </Link>
          ))}
        </nav>

        {menuOpen && (
          <nav id="mobile-navigation" className="nav-mobile" aria-label="手機主選單">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {language === 'zh' ? item.zh : item.en}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
