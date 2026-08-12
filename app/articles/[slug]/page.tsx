import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticles } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText, { BilingualMarkup } from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

// Cloudflare Pages 使用靜態匯出；文章清單在建置時由 generateStaticParams 取得。
export const dynamicParams = false;

interface ArticlePageProps {
  params: { slug: string };
}

// 雖然是動態抓取，但我們仍可以預先生成前 100 篇以優化效能
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.slice(0, 100).map(article => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const categoryLabels: Record<string, string> = {
    breaking: '即時快訊',
    'deep-dive': '深度報導',
    opinion: '社論專欄',
    review: '科技前沿',
  };
  
  const categoryLabel = categoryLabels[article.category] || article.category || '新聞報導';
  const categoryLabelEn: Record<string, string> = { 
    breaking: 'BREAKING NEWS', 
    'deep-dive': 'DEEP DIVE', 
    opinion: 'EDITORIAL', 
    review: 'TECH FRONTIER' 
  };

  const articleHtml = renderMarkdown(article.content);
  const articleHtmlEn = renderMarkdown(article.contentEn || article.content);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
          <nav aria-label="麵包屑" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors"><BilingualText zh="首頁" en="HOME" /></Link>
            <span aria-hidden="true">/</span>
            <Link href="/tags" className="hover:text-cyan-400 transition-colors"><BilingualText zh="標籤分類" en="TAG ARCHIVE" /></Link>
            <span aria-hidden="true">/</span>
            <span className="text-cyan-400"><BilingualText zh={categoryLabel} en={categoryLabelEn[article.category] || 'NEWS REPORT'} /></span>
          </nav>

          <header className="space-y-5 sm:space-y-6 border-b border-cyan-500/20 pb-8 sm:pb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                <BilingualText zh={categoryLabel} en={categoryLabelEn[article.category] || 'NEWS REPORT'} />
              </span>
              <span className="text-xs text-gray-500 font-mono">STAR-DATE · {article.date}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-orbitron tracking-tight text-white leading-[1.18]">
              <BilingualText zh={article.title} en={article.titleEn} block />
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 font-mono">
              <span><BilingualText zh={`發布日期：${article.date}`} en={`PUBLISHED: ${article.date}`} /></span>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <span className="text-cyan-400"><BilingualText zh={`特派記者：${article.author}`} en={`CORRESPONDENT: ${article.authorEn || article.author}`} /></span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1" aria-label="文章標籤">
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tags?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all font-mono"
                >
                  <BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} />
                </Link>
              ))}
            </div>
          </header>

          <article className="article-shell rounded-2xl border border-cyan-500/20 bg-[#121520]/80 backdrop-blur-xl px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12 shadow-[0_0_30px_rgba(0,191,255,0.05)]">
            <BilingualMarkup zhHtml={articleHtml} enHtml={articleHtmlEn} className="markdown-body" />
          </article>

          {article.sources.length > 0 && (
            <aside className="bg-[#121520]/40 border-l-4 border-cyan-400 p-5 sm:p-6 rounded-r-xl space-y-3">
              <h2 className="text-sm font-orbitron font-bold text-cyan-400 uppercase tracking-widest"><BilingualText zh="資料來源與引用" en="SOURCES & CITATIONS" /></h2>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-2 leading-relaxed">
                {article.sources.map((source, index) => <li key={`${source}-${index}`}>{source}</li>)}
              </ul>
            </aside>
          )}

          <div className="pt-2 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Link href="/" className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all">
              <BilingualText zh="← 返回星際首頁" en="← RETURN TO HOME TERMINAL" />
            </Link>
            <Link href="/tags" className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-all">
              <BilingualText zh="探索更多標籤 →" en="EXPLORE MORE TAGS →" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
