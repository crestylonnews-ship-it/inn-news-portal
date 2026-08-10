import Link from 'next/link';
import { getAllArticles } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpeningAnimation from '@/components/OpeningAnimation';
import LiveClock from '@/components/LiveClock';
import BilingualText from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

export default function Home() {
  const articles = getAllArticles(); // 已自動依照日期時間由新到舊排序

  // 動態自動化區塊分配：首頁模組依文章標籤抓取最新內容，不再只依賴固定 category。
  // 國際新聞優先：台灣／國內文章仍保留在全站串流，但不會在有全球新聞時搶占核心頭條。
  const isDomestic = (article: typeof articles[number]) =>
    article.category.startsWith('台灣') || article.category.startsWith('國內');
  const internationalArticles = articles.filter(article => !isDomestic(article));
  const domesticArticles = articles.filter(article => isDomestic(article));
  const prioritizedArticles = [...internationalArticles, ...domesticArticles];
  const featured = prioritizedArticles[0];
  const tickerArticle = prioritizedArticles[1] || prioritizedArticles[0];
  const subFeatured = prioritizedArticles.slice(1, 5);
  const hasAnyTag = (article: typeof articles[number], tags: string[]) =>
    article.tags.some(tag => tags.some(target => tag.toLowerCase() === target.toLowerCase()));
  const techFrontierTags = ['AI', '人工智慧', '科技', '科技前沿', '量子科技', '資安'];
  const editorialTags = ['社論評論', '深度報導', '政策', '國際', '教育'];
  const techFrontier = articles.filter(article => hasAnyTag(article, techFrontierTags)).slice(0, 4);
  const deepDives = articles.filter(article => hasAnyTag(article, editorialTags)).slice(0, 4);
  const latestFeed = prioritizedArticles.slice(3, 9); // 國際優先的最新報導
  const categoryEnglish: Record<string, string> = { breaking: 'BREAKING', review: 'TECH FRONTIER', 'deep-dive': 'DEEP DIVE', opinion: 'EDITORIAL' };

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <OpeningAnimation />

      <main className="content-shell flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-10 sm:space-y-16 py-8 sm:py-12">
        {/* Orbital News Terminal Cockpit */}
        <section className="hero-scene terminal-hero animate-rise-in">
          <div className="terminal-hero-topline">
            <span><BilingualText zh="INN // 星際軌道新聞陣列" en="INN // ORBITAL NEWS ARRAY" /></span>
            <span className="terminal-live"><i /> <BilingualText zh="即時串流 / 第四象限" en="LIVE FEED / Q4" /></span>
          </div>
          <div className="terminal-hero-grid">
            <div className="terminal-hero-main">
              <div className="terminal-kicker"><span className="terminal-kicker-mark" /><BilingualText zh="星際聯邦新聞終端" en="INTERSTELLAR FEDERATION TERMINAL" /></div>
              <h1 className="terminal-title"><BilingualText zh="星際聯邦新聞終端" en="INTERSTELLAR NEWS TERMINAL" block /></h1>
              <div className="terminal-system-line"><span><BilingualText zh="INN 新聞入口 //" en="INN NEWS PORTAL //" /></span><LiveClock /></div>
              <p className="terminal-lede"><BilingualText zh="星際軌道觀測站 • 以同等信息重力收攏地表文明的每一道訊號" en="An orbital observation station gathering every signal from surface civilization under equal informational gravity." block /></p>
            </div>
          </div>
          <div className="terminal-hero-footer"><span><BilingualText zh="觀測站識別：INN-Q4-001" en="STATION ID: INN-Q4-001" /></span><span><BilingualText zh="紀錄模式：持續" en="RECORD MODE: CONTINUOUS" /></span><span><BilingualText zh="上行鏈路：穩定" en="UPLINK: STABLE" /></span></div>
        </section>

        <section className="mission-strip animate-rise-in delay-1" aria-label="INN 品牌宗旨 / Mission">
          <div className="mission-strip-code">MISSION / 0001</div>
          <div className="mission-strip-copy">
            <p className="eyebrow-label"><BilingualText zh="聯邦官方觀測站" en="OFFICIAL OBSERVATION STATION" /></p>
            <p><BilingualText zh="將地表文明的權力更迭、社會事件與科技進展，悉數收攏進星聯的歸檔系統。" en="The station archives political shifts, social events and technological progress across surface civilization." block /></p>
          </div>
          <Link href="/about" className="mission-strip-link"><BilingualText zh="讀取完整宗旨 →" en="READ THE MANIFEST →" /></Link>
        </section>

        {/* Breaking News Ticker */}
        {tickerArticle && (
          <section className="ticker-section">
            <Link href={`/articles/${tickerArticle.slug}`} className="block group">
              <div className="ticker-strip bg-[#121520]/95 backdrop-blur-xl border border-red-500/40 rounded-xl p-4 md:px-6 flex flex-col items-stretch gap-3 shadow-[0_0_25px_rgba(255,0,80,0.2)] sm:flex-row sm:items-center sm:justify-between group-hover:border-red-400 group-hover:shadow-[0_0_35px_rgba(255,0,80,0.4)] transition-all">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden sm:gap-4">
                  <span className="flex-shrink-0 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-mono font-bold px-3 py-1 rounded-md animate-pulse">
                    <BilingualText zh="總署即時快訊" en="BREAKING NEWS" />
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base line-clamp-2 sm:truncate group-hover:text-red-300 transition-colors font-orbitron">
                    <BilingualText zh={tickerArticle.title} en={tickerArticle.titleEn} block />
                  </span>
                </div>
                <span className="text-red-400 font-mono font-bold text-sm flex-shrink-0 sm:pl-4 group-hover:translate-x-1 transition-transform">
                  <BilingualText zh="讀取 →" en="ACCESS →" />
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Top Grid: Featured Headline + Side Quick Feeds */}
        {featured && (
          <section className="primary-layout animate-rise-in delay-2 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="primary-feature lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <h2 className="section-title text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 neon-title-glow">
                  <BilingualText zh="核心頭條要聞" en="PRIME HEADLINE" />
                </h2>
                <span className="text-xs text-cyan-300 font-mono"><BilingualText zh="自動同步" en="AUTO-SYNCED" /></span>
              </div>
              <ArticleCard article={featured} featured={true} />
            </div>

            <div className="secondary-feed space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <h2 className="section-title text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 neon-title-glow">
                  <BilingualText zh="次要焦點" en="SUB-FEEDS" />
                </h2>
                <span className="text-xs text-gray-400 font-mono"><BilingualText zh="即時串流" en="LIVE STREAM" /></span>
              </div>
              <div className="headline-stack" aria-label="四篇次要焦點標題">
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
                          <BilingualText zh={article.category} en={categoryEnglish[article.category] || 'NEWS'} />
                          <span className="shrink-0 text-gray-500">{article.date}</span>
                        </span>
                        <span className="headline-title"><BilingualText zh={article.title} en={article.titleEn} block /></span>
                                                  <span className="headline-tags"><BilingualText zh={article.tags.slice(0, 2).map(tag => `#${tag}`).join('  ')} en={article.tags.slice(0, 2).map(tag => `#${tagToEnglish(tag)}`).join('  ')} /></span>

                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 bg-[#121520]/40 border border-cyan-500/20 rounded-xl text-center text-gray-500 text-sm">
                    <BilingualText zh="暫無更多焦點" en="NO ADDITIONAL FEEDS" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Multi-Column High Density Blocks: Tech Frontier & Deep Dives */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Tech Frontier Block */}
          <div className="module-panel space-y-6 bg-[#121520]/50 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <h2 className="section-title text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 neon-title-glow">
                <BilingualText zh="科技前沿專區" en="TECH FRONTIER" />
              </h2>
              <Link href="/tags?tag=科技" className="text-xs text-cyan-400 hover:underline font-mono"><BilingualText zh="查看全部 →" en="VIEW ALL →" /></Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {techFrontier.length > 0 ? (
                techFrontier.map(article => (
                  <ArticleCard key={article.slug} article={article} compact={true} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">                    <BilingualText zh="此區塊自動抓取最新科技文章" en="LATEST TECHNOLOGY REPORTS AUTO-LOADED" />
</div>
              )}
            </div>
          </div>

          {/* Editorial & Deep Dive Block */}
          <div className="module-panel space-y-6 bg-[#121520]/50 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <h2 className="section-title text-xl font-bold font-orbitron text-cyan-400 tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 neon-title-glow">
                <BilingualText zh="深度社論評論" en="EDITORIAL & DEEP DIVE" />
              </h2>
              <Link href="/opinion" className="text-xs text-cyan-400 hover:underline font-mono"><BilingualText zh="查看全部 →" en="VIEW ALL →" /></Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {deepDives.length > 0 ? (
                deepDives.map(article => (
                  <ArticleCard key={article.slug} article={article} compact={true} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">                    <BilingualText zh="此區塊自動抓取最新社論文章" en="LATEST EDITORIAL REPORTS AUTO-LOADED" />
</div>
              )}
            </div>
          </div>
        </section>

        {/* Latest Feed Full Grid Section (Auto Sorted by Date) */}
        <section className="latest-section space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
            <h2 className="section-title text-xl sm:text-2xl font-bold font-orbitron text-cyan-400 tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 neon-title-glow">
              <BilingualText zh="全站最新報導串流" en="GLOBAL LATEST FEED" />
            </h2>
                          <span className="text-xs text-gray-400 font-mono"><BilingualText zh={`總計：${articles.length} 篇報導`} en={`TOTAL: ${articles.length} ARTICLES`} /></span>

          </div>
          {latestFeed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {latestFeed.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-[#121520]/40 rounded-xl border border-cyan-500/10 font-mono">
              <BilingualText zh="[系統] 正在等待更多自動發布文章推送至 content/articles..." en="[SYSTEM] AWAITING MORE AUTO-PUBLISHED REPORTS..." />
            </div>
          )}
        </section>

        {/* Quick Navigation Footer Blocks */}
        <section className="portal-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 pt-2 sm:pt-6">
          <Link href="/tags" className="portal-card group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron"><BilingualText zh="標籤分類雲" en="TAG CLOUD" /></h3>
            <p className="text-sm text-gray-400 font-serif"><BilingualText zh="依據發文自動生成的多元標籤矩陣與即時檢索。" en="A dynamic tag matrix generated from published reports for live retrieval." block /></p>
          </Link>
          <Link href="/timeline" className="portal-card group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron"><BilingualText zh="時間線歸檔" en="TIMELINE" /></h3>
            <p className="text-sm text-gray-400 font-serif"><BilingualText zh="嚴格依照星曆順序串聯的歷史檔案與事件脈絡。" en="Historical records and event context linked in strict star-date order." block /></p>
          </Link>
          <Link href="/about" className="portal-card group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors font-orbitron"><BilingualText zh="關於本網" en="ABOUT INN" /></h3>
            <p className="text-sm text-gray-400 font-serif"><BilingualText zh="一座運行於星際軌道的觀測站，將事件轉譯成可追溯、可理解的乾淨波形。" en="An orbital observation station translating events into clean, traceable and understandable signals." block /></p>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
