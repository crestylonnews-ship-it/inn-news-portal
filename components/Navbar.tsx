'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0b0f]/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all">
            <span className="text-cyan-400 font-bold text-lg">⬢</span>
          </div>
          <div>
            <span className="font-orbitron font-extrabold text-xl tracking-wider text-white text-glow">INN NEWS</span>
            <span className="block text-[10px] tracking-widest text-cyan-400 uppercase">星際聯邦官方新聞網</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-grow max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋新聞標題、內文或標籤..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121520] border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.2)] transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-sm hover:text-cyan-300">
              🔍
            </button>
          </div>
        </form>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            首頁
          </Link>
          <Link href="/tags" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            標籤分類
          </Link>
          <Link href="/timeline" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            時間線歸檔
          </Link>
          <Link href="/opinion" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            社論與評論
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            關於本網
          </Link>
        </nav>
      </div>
    </header>
  );
}
