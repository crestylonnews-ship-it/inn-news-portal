'use client';

import Link from 'next/link';
import { useState } from 'react';
import '@/app/Nav.css';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="nav-logo flex items-center gap-2">
          <span className="logo-symbol">⬢</span> INN <span className="logo-symbol">⬢</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-menu hidden md:flex">
          <Link href="/" className="nav-link">
            首頁
          </Link>
          <Link href="/timeline" className="nav-link">
            時間線
          </Link>
          <Link href="/opinion" className="nav-link">
            社論
          </Link>
          <Link href="/about" className="nav-link">
            關於
          </Link>
          <Link href="/admin" className="nav-admin">
            後台
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cyan-400 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 px-4 space-y-2 pb-4 glass-panel">
          <Link href="/" className="block py-2 text-cyan-400 text-sm">
            首頁
          </Link>
          <Link href="/timeline" className="block py-2 text-gray-300 text-sm">
            時間線
          </Link>
          <Link href="/opinion" className="block py-2 text-gray-300 text-sm">
            社論
          </Link>
          <Link href="/about" className="block py-2 text-gray-300 text-sm">
            關於
          </Link>
          <Link href="/admin" className="block py-2 text-cyan-400 text-sm font-bold">
            後台
          </Link>
        </div>
      )}
    </nav>
  );
}
