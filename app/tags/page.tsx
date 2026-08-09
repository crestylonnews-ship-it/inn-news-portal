'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Article } from '@/lib/types';

function TagsContent() {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/articles')
      .then(response => response.json())
      .then(data => {
        if (!cancelled) setArticles(data.articles || []);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach(article => article.tags?.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));

    // Keep the three editorial education topics visible as permanent entry points.
    ['國際教育議題', '國內教育議題', '青少年議題'].forEach(tag => {
      if (!counts.has(tag)) counts.set(tag, 0);
    });

    return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant'));
  }, [articles]);

  const filteredArticles = selectedTag
    ? articles.filter(article => article.tags?.includes(selectedTag))
    : articles;
  const maxCount = tagStats[0]?.count || 1;

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-3xl space-y-4">
        <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">✦ TAG ARCHIVE ✦</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-orbitron">新聞標籤自動化分類</h1>
              </header>

      <section aria-labelledby="tag-cloud-title" className="rounded-2xl border border-cyan-500/20 bg-[#121520]/80 p-4 shadow-[0_0_20px_rgba(0,191,255,0.05)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-cyan-500/15 pb-3">
          <h2 id="tag-cloud-title" className="font-orbitron text-sm font-bold tracking-wider text-cyan-400 sm:text-base">TAG CLOUD // 動態標籤</h2>
          <span className="text-xs text-gray-500 font-mono">{tagStats.length} TAGS</span>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-cyan-300">正在同步標籤矩陣…</div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/tags" className={`rounded-xl border px-3 py-2 text-sm transition-all sm:px-4 ${!selectedTag ? 'border-cyan-300 bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] font-bold' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'}`}>
              全部新聞 <span className="ml-1 opacity-70">({articles.length})</span>
            </Link>
            {tagStats.map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              const scale = count >= maxCount * 0.75 ? 'text-base' : count >= maxCount * 0.4 ? 'text-sm' : 'text-xs';
              return (
                <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`} className={`rounded-xl border px-3 py-2 transition-all sm:px-4 ${scale} ${isSelected ? 'border-cyan-300 bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] font-bold' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/20'}`}>
                  #{tag} <span className="ml-1 opacity-60">{count}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-6" aria-labelledby="filtered-title">
        <div className="flex flex-col gap-2 border-b border-cyan-500/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="filtered-title" className="text-xl font-bold text-cyan-400 sm:text-2xl font-orbitron">{selectedTag ? `包含標籤 #${selectedTag} 的報導` : '所有星際報導'}</h2>
          <span className="text-xs text-gray-400 font-mono">共 {filteredArticles.length} 篇</span>
        </div>
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filteredArticles.map(article => <ArticleCard key={article.slug} article={article} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-500/10 bg-[#121520]/40 py-16 text-center text-gray-400">{loading ? '正在讀取文章…' : '沒有找到符合此標籤的文章。'}</div>
        )}
      </section>
    </div>
  );
}

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <Suspense fallback={<div className="py-20 text-center text-cyan-400">正在載入標籤分類...</div>}><TagsContent /></Suspense>
      </main>
      <Footer />
    </div>
  );
}
