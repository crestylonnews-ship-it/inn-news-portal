import Link from 'next/link';
import { getAllArticles } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpeningAnimation from '@/components/OpeningAnimation';
import LiveClock from '@/components/LiveClock';
import BilingualText from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

// Cloudflare Pages static export：建置時同步最新內容，並由部署端重新建置更新。
export const dynamic = 'force-static';
export const revalidate = 300; // 5 分鐘快取

export default async function Home() {
  const articles = await getAllArticles(); 
  
  const isDomestic = (article: any) =>
    article.category.startsWith('台灣') || article.category.startsWith('國內');
    
  const internationalArticles = articles.filter(article => !isDomestic(article));
  const domesticArticles = articles.filter(article => isDomestic(article));
  const prioritizedArticles = [...internationalArticles, ...domesticArticles];

  // 取得最新 10 篇作為全站動態更新的 Ticker 或 Prime Headline
  const latestArticles = prioritizedArticles.slice(0, 10);
  const primeHeadline = latestArticles[0];
  const secondaryHeadlines = latestArticles.slice(1, 4);
  const restOfLatest = latestArticles.slice(4);

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white selection:bg-cyan-500 selection:text-black font-sans">
      <OpeningAnimation />
      <Navbar />
      
      {/* Ticker Section */}
      <section className="ticker-section relative z-20 overflow-hidden border-y border-cyan-500/30 bg-black/80 py-2 backdrop-blur-md" aria-label="即時新聞跑馬燈">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="ticker-label flex shrink-0 items-center rounded bg-red-600 px-2 py-0.5 text-[10px] font-black tracking-tighter text-white animate-pulse uppercase">
            LIVE FEED
          </div>
          <div className="ticker-viewport min-w-0 flex-1 overflow-hidden">
            <div className="ticker-track flex w-max whitespace-nowrap text-xs font-mono text-cyan-400/80">
              {[0, 1].map(copy => (
                <div key={copy} className="ticker-group flex shrink-0 items-center gap-8 pr-8" aria-hidden={copy === 1}>
                  {latestArticles.map(a => (
                    <span key={`${a.slug}-${copy}`} className="flex min-w-0 shrink-0 items-center">
                      <span className="mr-2 text-red-500">✦</span>
                      {a.title} / {a.titleEn}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="content-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12 lg:space-y-20">
        {/* Prime Section */}
        <section className="primary-layout grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {primeHeadline && (
            <div className="lg:col-span-8 group">
              <Link href={`/articles/${primeHeadline.slug}`} className="block space-y-6">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 group-hover:border-cyan-400/50 transition-all duration-500">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-cyan-500/10 font-black text-9xl select-none">INN</div>
                  </div>
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded tracking-widest uppercase">Prime Headline</span>
                    <span className="text-xs font-mono text-cyan-400/60">{primeHeadline.date}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/80 to-transparent">
                    <h2 className="prime-headline-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-orbitron text-white leading-tight group-hover:text-cyan-400 transition-colors">
                      <BilingualText zh={primeHeadline.title} en={primeHeadline.titleEn} block />
                    </h2>
                  </div>
                </div>
                <p className="prime-headline-excerpt text-base sm:text-lg leading-relaxed line-clamp-3 pl-4 border-l-2 border-cyan-500/30 italic">
                  <BilingualText zh={primeHeadline.excerpt || ''} en={primeHeadline.excerptEn || ''} block />
                </p>
              </Link>
            </div>
          )}

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
              <h3 className="font-orbitron font-bold text-sm tracking-[0.2em] text-cyan-400 uppercase">Flash Points</h3>
              <LiveClock />
            </div>
            <div className="space-y-6">
              {secondaryHeadlines.map((a, i) => (
                <Link key={i} href={`/articles/${a.slug}`} className="block group border-b border-white/5 pb-6 last:border-0">
                  <article className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                      <span className="text-cyan-500">#{i + 2}</span>
                      <span>{a.date}</span>
                    </div>
                    <h4 className="text-lg font-bold leading-snug group-hover:text-cyan-400 transition-colors">
                      <BilingualText zh={a.title} en={a.titleEn} block />
                    </h4>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Global Stream Section */}
        <section className="latest-section space-y-8 lg:space-y-12">
          <div className="flex items-end justify-between border-b-2 border-cyan-500/20 pb-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black font-orbitron tracking-tighter text-white uppercase italic">
                Global Civilization Stream
              </h2>
              <p className="text-xs font-mono text-cyan-500/60 tracking-widest uppercase">Real-time observational data from surface nodes</p>
            </div>
            <Link href="/tags" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-widest border border-cyan-400/30 px-4 py-2 rounded-lg hover:bg-cyan-400/10">
              Access Archives →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-16">
            {prioritizedArticles.slice(4, 22).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-cyan-950/10 border border-cyan-500/20 rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['breaking', 'deep-dive', 'opinion', 'review'].map((cat) => (
              <div key={cat} className="space-y-4">
                <h3 className="text-[10px] font-black font-orbitron text-cyan-500 tracking-[0.3em] uppercase opacity-50">{cat}</h3>
                <div className="space-y-2">
                  {prioritizedArticles.filter(a => a.category === cat).slice(0, 3).map((a, i) => (
                    <Link key={i} href={`/articles/${a.slug}`} className="block text-sm text-gray-400 hover:text-white transition-colors truncate">
                      • {a.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
