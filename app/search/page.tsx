'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Article } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(Boolean(query));

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          const q = query.toLowerCase();
          const filtered = data.articles.filter((article: Article) =>
            article.title.toLowerCase().includes(q) ||
            article.content.toLowerCase().includes(q) ||
            article.tags?.some((tag: string) => tag.toLowerCase().includes(q)) ||
            article.author.toLowerCase().includes(q)
          );
          setResults(filtered);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page-flow search-page space-y-8 sm:space-y-10">
      <header className="page-hero search-hero space-y-5">
        <div className="page-kicker">SEARCH CHANNEL // INDEX QUERY</div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="eyebrow-label">INN ARCHIVE LOOKUP</p>
            <h1 className="page-title font-orbitron text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              搜尋結果
            </h1>
            {query ? (
              <p className="search-query font-orbitron text-lg text-cyan-300 sm:text-xl">「{query}」</p>
            ) : (
              <p className="text-sm leading-7 text-slate-400 sm:text-base">輸入關鍵字以檢索新聞標題、內文、作者與標籤。</p>
            )}
          </div>
          <div className="page-stat shrink-0">
            <span className="page-stat-label">MATCHED REPORTS</span>
            <strong>{loading ? '—' : results.length.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        <div className="page-hero-line" aria-hidden="true" />
      </header>

      {loading ? (
        <div className="status-panel" role="status">
          <span className="status-panel-label">SEARCHING ARCHIVE</span>
          <p>正在同步搜尋結果……</p>
          <div className="status-progress" aria-hidden="true"><span /></div>
        </div>
      ) : results.length > 0 ? (
        <section className="result-section space-y-5" aria-label="搜尋結果列表">
          <div className="result-toolbar">
            <span className="section-code">RESULT STREAM // {results.length.toString().padStart(2, '0')} RECORDS</span>
            <span className="section-note">TITLE · BODY · TAG · AUTHOR</span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <div className="status-panel empty-state space-y-3" role="status">
          <span className="status-panel-label">NO MATCH FOUND</span>
          <p className="font-orbitron text-lg text-slate-200">沒有找到與「{query}」相關的新聞</p>
          <p className="text-sm leading-7 text-slate-400">請嘗試更換關鍵字，或前往標籤分類頁面尋找相關報導。</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="content-shell flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 sm:py-12 lg:py-16">
        <Suspense fallback={<div className="status-panel" role="status">正在載入搜尋結果……</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
