import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticleSlugs, getArticleBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText, { BilingualMarkup } from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

interface ArticlePageProps {
  params: { slug: string };
}

// Cloudflare Pages 無伺服器動態路由；所有已提交文章都需在建置時生成。
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map(slug => ({ slug }));
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
    <div className="article-page min-h-screen text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <main className="article-page-main flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
          <nav aria-label="麵包屑" className="article-breadcrumb">
            <div className="article-breadcrumb-language article-breadcrumb-zh" lang="zh-Hant">
              <Link href="/">首頁</Link><span aria-hidden="true">/</span><Link href="/tags">標籤分類</Link>
            </div>
            <div className="article-breadcrumb-language article-breadcrumb-en" lang="en">
              <Link href="/">HOME</Link><span aria-hidden="true">/</span><Link href="/tags">TAG ARCHIVE</Link>
            </div>
          </nav>

          <header className="article-header">
            <div className="article-header-context">
              <div className="article-category-pair" aria-label="文章分類">
                <span className="article-category-language article-category-zh" lang="zh-Hant">{categoryLabel}</span>
                <span className="article-category-language article-category-en" lang="en">{categoryLabelEn[article.category] || 'NEWS REPORT'}</span>
              </div>
              <time dateTime={article.date} className="article-date">
                <span className="article-date-label">
                  <span className="article-date-zh" lang="zh-Hant">發布日期</span>
                  <span className="article-date-en" lang="en">STAR DATE</span>
                </span>
                <strong>{article.date}</strong>
              </time>
            </div>

            <h1 className="article-title">
              <span className="article-title-zh" lang="zh-Hant">{article.title}</span>
              <span className="article-title-en" lang="en">{article.titleEn}</span>
            </h1>

            <div className="article-author-pair" aria-label="文章作者">
              <span className="article-author-language article-author-zh" lang="zh-Hant"><i>特派記者</i><b>{article.author}</b></span>
              <span className="article-author-language article-author-en" lang="en"><i>CORRESPONDENT</i><b>{article.authorEn || article.author}</b></span>
            </div>

            {article.tags.length > 0 && <div className="article-tag-list" aria-label="文章標籤">
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tags?tag=${encodeURIComponent(tag)}`}
                  className="article-tag-link"
                >
                  <BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} />
                </Link>
              ))}
            </div>}
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
