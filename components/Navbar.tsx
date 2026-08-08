import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0b0f]/80 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all">
            <span className="text-cyan-400 font-bold text-lg">⬢</span>
          </div>
          <div>
            <span className="font-orbitron font-extrabold text-xl tracking-wider text-white text-glow">INN NEWS</span>
            <span className="block text-[10px] tracking-widest text-cyan-400 uppercase">星際聯邦官方新聞網</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors">
            首頁
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
          <Link href="/admin" className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-400 transition-all">
            發布後台
          </Link>
        </nav>
      </div>
    </header>
  );
}
