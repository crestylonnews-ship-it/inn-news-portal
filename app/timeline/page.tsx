import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllArticles } from '@/lib/posts';
import Link from 'next/link';
import BilingualText from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

export default async function TimelinePage() {
  const articles = await getAllArticles();
  const latestDate = articles[0]?.date || 'NO DATA';
  const categories = new Set(articles.map(article => article.category)).size;

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="content-shell flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full py-8 sm:py-12 lg:py-16">
        <div className="page-flow timeline-page space-y-8 sm:space-y-10">
          <header className="page-hero timeline-hero space-y-5">
            <div className="page-kicker">ARCHIVE CHANNEL // CHRONOLOGY INDEX</div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className="eyebrow-label">FEDERATION NEWS MEMORY</p>
                <h1 className="page-title font-orbitron text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"><BilingualText zh="星曆時間線歸檔" en="STAR-DATE TIMELINE ARCHIVE" /></h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"><BilingualText zh="依照發布日期整理的新聞脈絡，從最新訊號回溯每一則重要紀錄。" en="A chronological news stream that traces every important record from the latest signal backward." block /></p>
              </div>
              <div className="page-stat-grid">
                <div className="page-stat"><BilingualText zh="紀錄" en="RECORDS" /><strong>{articles.length.toString().padStart(2, '0')}</strong></div>
                <div className="page-stat"><BilingualText zh="區域" en="SECTORS" /><strong>{categories.toString().padStart(2, '0')}</strong></div>
              </div>
            </div>
            <div className="page-hero-line" aria-hidden="true" />
          </header>

                      <section className="timeline-panel" aria-label="新聞時間線 / News timeline">

            <div className="timeline-panel-header">
              <span className="section-code">CHRONOLOGY STREAM // LIVE ARCHIVE</span>
              <span className="section-note">LATEST SYNC: {latestDate}</span>
            </div>
            <div className="timeline-rail">
              {articles.map((article, index) => (
                <article key={article.slug} className="timeline-entry group">
                  <div className="timeline-node" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></div>
                  <div className="timeline-entry-meta">
                    <span className="timeline-date">{article.date}</span>
                    <span className="timeline-category"><BilingualText zh={article.category} en={article.category.toUpperCase()} /></span>
                  </div>
                  <div className="timeline-entry-body">
                    <h2 className="font-orbitron text-lg font-bold leading-7 text-slate-100 sm:text-xl">
                      <Link href={`/articles/${article.slug}`} className="timeline-title transition-colors hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
                        <BilingualText zh={article.title} en={article.titleEn} block />
                      </Link>
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-400"><BilingualText zh={article.excerpt || ''} en={article.excerptEn || article.excerpt || ''} block /></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map(tag => <span key={tag} className="timeline-tag"><BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} /></span>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
