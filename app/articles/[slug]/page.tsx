import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    breaking: '即時快訊',
    'deep-dive': '深度報導',
    opinion: '社論專欄',
    review: '科技前沿',
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-6 w-full py-12 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">首頁</Link>
          <span>/</span>
          <Link href="/tags" className="hover:text-cyan-400 transition-colors">標籤分類</Link>
          <span>/</span>
          <span className="text-cyan-400">{categoryLabels[article.category] || '新聞報導'}</span>
        </div>

        {/* Article Header */}
        <header className="space-y-6 text-center border-b border-cyan-500/20 pb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
            {categoryLabels[article.category] || '報導'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-orbitron tracking-tight text-white leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-mono pt-2">
            <span>發布日期：{article.date}</span>
            <span>•</span>
            <span className="text-cyan-400">特派記者：{article.author}</span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tags?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all font-mono"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article Body Content */}
        <article className="bg-[#121520]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 md:p-12 shadow-[0_0_30px_rgba(0,191,255,0.05)] space-y-6 text-lg text-gray-200 leading-relaxed font-serif">
          {article.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-justify indent-8">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Sources Section */}
        {article.sources && article.sources.length > 0 && (
          <div className="bg-[#121520]/40 border-l-4 border-cyan-400 p-6 rounded-r-xl space-y-2">
            <h3 className="text-sm font-orbitron font-bold text-cyan-400 uppercase tracking-widest">資料來源與引用</h3>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              {article.sources.map((src, idx) => (
                <li key={idx}>{src}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Back Navigation */}
        <div className="pt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all">
            ← 返回星際首頁
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
