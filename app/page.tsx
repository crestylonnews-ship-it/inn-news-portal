import Link from 'next/link';
import { getAllArticles } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpeningAnimation from '@/components/OpeningAnimation';

export default function Home() {
  const articles = getAllArticles(); // 已自動依照日期時間由新到舊排序

  // 動態自動化區塊分配
  const breakingNews = articles.filter(a => a.category === 'breaking');
  const featured = articles[0];
  const tickerArticle = articles[1] || articles[0];
  
  // 多區塊自動填充
  const subFeatured = articles.slice(1, 4);
  const techFrontier = articles.filter(a => a.category === 'review').slice(0, 4);
  const deepDives = articles.filter(a => a.category === 'deep-dive' || a.category === 'opinion').slice(0, 4);
  const latestFeed = articles.slice(3, 9); // 更多最新報導

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <OpeningAnimation />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-10 sm:space-y-16 py-8 sm:py-12">
        {/* Hero Banner with Sci-Fi Glow & Bilingual */}
        <section className="hero-scene animate-rise-in text-center space-y-4 py-3 sm:py-6 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[150px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(0,191,255,0.3)]">
            <span>INTERSTELLAR FEDERATION TERMINAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold font-orbitron tracking-tight text-glow neon-title-glow">
            星際聯邦新聞終端 <span className="text-cyan-400 text-2xl md:text-4xl block mt-1">INN NEWS PORTAL // Y/3</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-serif">
            第四象限即時情報網 • 全自動量子同步與多維區塊新聞串流
          </p>
        </section>

        {/* Breaking News Ticker */}
        {tickerArticle && (
          <section>
            <Link href={`/articles/${tickerArticle.slug}`} className="block group">
              <div className="bg-[#121520]/95 backdrop-blur-xl border border-red-500/40 rounded-xl p-4 md:px-6 flex flex-col items-stretch gap-3 shadow-[0_0_25px_rgba(255,0,80,0.2)] sm:flex-row sm:items-center sm:justify-between group-hover:border-red-400 group-hover:shadow-[0_0_35px_rgba(255,0,80,0.4)] transition-all">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden sm:gap-4">
                  <span className="flex-shrink-0 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-mono font-bold px-3 py-1 rounded-md animate-pulse">
                    總署即時快訊 // BREAKING NEWS
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base line-clamp-2 sm:truncate group-hover:text-red-300 transition-colors font-orbitron">
                    {tickerArticle.title}
                  </span>
                </div>
                <span className="text-red-400 font-mono font-bold text-sm flex-shrink-0 sm:pl-4 group-hover:translate-x-1 transition-transform">
                  ACCESS →
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Top Grid: Featured Headline + Side Quick Feeds */}
        {featured && (
          <section className="animate-rise-in delay-2 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2 neon-title-glow">
                  核心頭條要聞 <span className="text-xs font-mono text-gray-400">// PRIME HEADLINE</span>
                </h2>
                <span className="text-xs text-cyan-300 font-mono">AUTO-SYNCED</span>
              </div>
              <ArticleCard article={featured} featured={true} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2 neon-title-glow">
                  次要焦點 <span className="text-xs font-mono text-gray-400">// SUB-FEEDS</span>
                </h2>
                <span className="text-xs text-gray-400 font-mono">LIVE STREAM</span>
              </div>
              <div className="headline-stack" aria-label="三篇次要焦點標題">
                {subFeatured.length > 0 ? (
                  subFeatured.map((article, index) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
                      className="headline-item group"
                    >
                      <span className="headline-index">0{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-2 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-300/70">
                          <span className="truncate">{article.category}</span>
                          <span className="shrink-0 text-gray-500">{article.date}</span>
                        </span>
                        <span className="headline-title">{article.title}</span>
                        <span className="headline-tags">{article.tags.slice(0, 2).map(tag => `#${tag}`).join('  ')}</span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 bg-[#121520]/40 border border-cyan-500/20 rounded-xl text-center text-gray-500 text-sm">
                    暫無更多焦點
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Multi-Column High Density Blocks: Tech Frontier & Deep Dives */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Tech Frontier Block */}
          <div className="space-y-6 bg-[#121520]/50 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2 neon-title-glow">
                科技前沿專區 <span className="text-xs font-mono text-gray-400">// TECH FRONTIER</span>
              </h2>
              <Link href="/tags?tag=AI" className="text-xs text-cyan-400 hover:underline font-mono">查看全部 →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {techFrontier.length > 0 ? (
                techFrontier.map(article => (
                  <ArticleCard key={article.slug} article={article} compact={true} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">此區塊自動抓取最新科技文章</div>
              )}
            </div>
          </div>

          {/* Editorial & Deep Dive Block */}
          <div className="space-y-6 bg-[#121520]/50 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2 neon-title-glow">
                深度社論評論 <span className="text-xs font-mono text-gray-400">// EDITORIAL & DIVE</span>
              </h2>
              <Link href="/opinion" className="text-xs text-cyan-400 hover:underline font-mono">查看全部 →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {deepDives.length > 0 ? (
                deepDives.map(article => (
                  <ArticleCard key={article.slug} article={article} compact={true} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">此區塊自動抓取最新社論文章</div>
              )}
            </div>
          </div>
        </section>

        {/* Latest Feed Full Grid Section (Auto Sorted by Date) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2 neon-title-glow">
              全站最新報導串流 <span className="text-xs font-mono text-gray-400">// GLOBAL LATEST FEED (AUTO-SORTED)</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">TOTAL: {articles.length} ARTICLES</span>
          </div>
          {latestFeed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {latestFeed.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-[#121520]/40 rounded-xl border border-cyan-500/10 font-mono">
              [SYSTEM] 正在等待更多自動發布文章推送至 content/articles...
            </div>
          )}
        </section>

        {/* Quick Navigation Footer Blocks */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 pt-2 sm:pt-6">
          <Link href="/tags" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron">標籤分類雲 // TAG CLOUD</h3>
            <p className="text-sm text-gray-400 font-serif">依據發文自動生成的多元標籤矩陣與即時檢索。</p>
          </Link>
          <Link href="/timeline" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron">時間線歸檔 // TIMELINE</h3>
            <p className="text-sm text-gray-400 font-serif">嚴格依照星曆順序串聯的歷史檔案與事件脈絡。</p>
          </Link>
          <Link href="/about" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron">關於本網 // ABOUT INN</h3>
            <p className="text-sm text-gray-400 font-serif">了解星際聯邦總署新聞網使命、編輯規範與廣播授權。</p>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
