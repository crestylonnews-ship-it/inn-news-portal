import Link from 'next/link';
import { getAllArticles } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const tickerArticle = articles[1] || articles[0];
  const latestArticles = articles.slice(2, 8);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 w-full space-y-16 py-12">
        {/* Hero Banner */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-2">
            ✦ GALAXY TERMINAL ✦
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-orbitron tracking-tight text-glow">
            星際聯邦新聞終端
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-serif">
            掌握第四象限最新脈動、政策解讀與前沿科技情報
          </p>
        </section>

        {/* Breaking News Ticker */}
        {tickerArticle && (
          <section>
            <Link href={`/articles/${tickerArticle.slug}`} className="block group">
              <div className="bg-[#121520]/90 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 md:px-6 flex items-center justify-between shadow-[0_0_20px_rgba(255,0,110,0.1)] group-hover:border-red-400 group-hover:shadow-[0_0_25px_rgba(255,0,110,0.25)] transition-all">
                <div className="flex items-center gap-4 overflow-hidden">
                  <span className="flex-shrink-0 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1 rounded-md animate-pulse">
                    ⚡ 即時快訊
                  </span>
                  <span className="text-white font-medium text-sm md:text-base truncate group-hover:text-red-300 transition-colors">
                    {tickerArticle.title}
                  </span>
                </div>
                <span className="text-red-400 font-bold text-sm flex-shrink-0 pl-4 group-hover:translate-x-1 transition-transform">
                  查看詳情 →
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Featured Headline Section */}
        {featured && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <h2 className="text-2xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2">
                <span>◆</span> 頭條要聞
              </h2>
              <span className="text-xs text-gray-400 font-mono">TOP HEADLINE</span>
            </div>
            <ArticleCard article={featured} featured={true} />
          </section>
        )}

        {/* Latest Articles Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <h2 className="text-2xl font-bold font-orbitron text-cyan-400 tracking-wider flex items-center gap-2">
              <span>◆</span> 最新報導
            </h2>
            <span className="text-xs text-gray-400 font-mono">LATEST FEED</span>
          </div>
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-[#121520]/40 rounded-xl border border-cyan-500/10">
              目前尚無更多報導
            </div>
          )}
        </section>

        {/* Quick Navigation Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Link href="/timeline" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">📅 時間線歸檔</h3>
            <p className="text-sm text-gray-400">依據星曆順序檢視所有歷史新聞與事件發展脈絡。</p>
          </Link>
          <Link href="/opinion" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">✒️ 社論與評論</h3>
            <p className="text-sm text-gray-400">深度剖析聯邦政策走向與銀河地緣政治局勢。</p>
          </Link>
          <Link href="/about" className="group bg-[#121520]/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 transition-all">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">🏛️ 關於星際新聞</h3>
            <p className="text-sm text-gray-400">了解 INN 媒體使命、編輯規範與聯邦廣播權限。</p>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
