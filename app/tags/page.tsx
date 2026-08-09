'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Article } from '@/lib/types';
import BilingualText from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

function TagsContent() {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);

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
  const compactTagStats = useMemo(() => {
    const selected = selectedTag ? tagStats.find(item => item.tag === selectedTag) : null;
    const topTags = tagStats.slice(0, 10);
    if (selected && !topTags.some(item => item.tag === selected.tag)) {
      return [selected, ...topTags.slice(0, 9)];
    }
    return topTags;
  }, [selectedTag, tagStats]);
  const visibleTagStats = showAllTags ? tagStats : compactTagStats;
  const hiddenTagCount = Math.max(tagStats.length - compactTagStats.length, 0);

  useEffect(() => {
    if (!selectedTag || loading) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById('filtered-results');
      if (!target) return;
      const offset = window.innerWidth <= 620 ? 76 : 96;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [selectedTag, loading]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-3xl space-y-4">
        <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">✦ TAG ARCHIVE ✦</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-orbitron"><BilingualText zh="新聞標籤自動化分類" en="AUTOMATED NEWS TAG ARCHIVE" /></h1>
              </header>

      <section aria-labelledby="tag-cloud-title" className="tag-cloud-console rounded-2xl border border-cyan-500/20 bg-[#121520]/80 p-4 shadow-[0_0_20px_rgba(0,191,255,0.05)] sm:p-6">
        <div className="tag-cloud-console-header mb-4 flex items-center justify-between gap-3 border-b border-cyan-500/15 pb-3">
          <h2 id="tag-cloud-title" className="font-orbitron text-sm font-bold tracking-wider text-cyan-400 sm:text-base"><BilingualText zh="動態標籤" en="TAG CLOUD" /></h2>
          <span className="text-xs text-gray-500 font-mono">{tagStats.length} TAGS</span>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-cyan-300"><BilingualText zh="正在同步標籤矩陣…" en="SYNCING TAG MATRIX…" /></div>
        ) : (
          <>
            <div className="tag-signal-grid" aria-label="高權重動態標籤 / High-signal dynamic tags">
              <Link href="/tags" className={`tag-signal-card tag-signal-card-all ${!selectedTag ? 'is-selected' : ''}`}>
                <span className="tag-signal-index">00</span>
                <span className="tag-signal-copy"><BilingualText zh="全部新聞" en="ALL REPORTS" /></span>
                <span className="tag-signal-count">{articles.length}</span>
              </Link>
              {visibleTagStats.map(({ tag, count }, index) => {
                const isSelected = selectedTag === tag;
                const intensity = count >= maxCount * 0.75 ? 'is-hot' : count >= maxCount * 0.4 ? 'is-active' : '';
                return (
                  <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`} className={`tag-signal-card ${intensity} ${isSelected ? 'is-selected' : ''}`}>
                    <span className="tag-signal-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="tag-signal-copy"><BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} /></span>
                    <span className="tag-signal-count">{count}</span>
                  </Link>
                );
              })}
            </div>
            {hiddenTagCount > 0 && (
              <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-cyan-500/15 pt-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-relaxed text-gray-500 font-mono">
                  <BilingualText zh={`已顯示 ${compactTagStats.length} 個高權重標籤，另有 ${hiddenTagCount} 個標籤收納於完整矩陣。`} en={`${compactTagStats.length} high-signal tags shown; ${hiddenTagCount} additional tags are stored in the full matrix.`} block />
                </p>
                <button type="button" onClick={() => setShowAllTags(value => !value)} aria-expanded={showAllTags} aria-controls="full-tag-matrix" className="tag-matrix-toggle">
                  <BilingualText zh={showAllTags ? '收起完整矩陣 ↑' : '展開完整矩陣 ↓'} en={showAllTags ? 'COLLAPSE MATRIX ↑' : 'OPEN FULL MATRIX ↓'} />
                </button>
              </div>
            )}
            {showAllTags && (
              <div id="full-tag-matrix" className="tag-matrix-panel mt-4" aria-label="完整標籤矩陣 / Full tag matrix">
                <div className="tag-matrix-caption"><BilingualText zh="完整標籤矩陣" en="FULL TAG MATRIX" /></div>
                <div className="flex flex-wrap gap-2">
                  {tagStats.map(({ tag, count }) => (
                    <Link key={`matrix-${tag}`} href={`/tags?tag=${encodeURIComponent(tag)}`} className={`tag-matrix-chip ${selectedTag === tag ? 'is-selected' : ''}`}>
                      <BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} /> <span>{count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section id="filtered-results" className="tags-filter-results space-y-6" aria-labelledby="filtered-title">
        <div className="flex flex-col gap-2 border-b border-cyan-500/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="filtered-title" className="text-xl font-bold text-cyan-400 sm:text-2xl font-orbitron">{selectedTag ? <BilingualText zh={`包含標籤 #${selectedTag} 的報導`} en={`REPORTS WITH TAG #${selectedTag}`} /> : <BilingualText zh="所有星際報導" en="ALL INTERSTELLAR REPORTS" />}</h2>
          <span className="text-xs text-gray-400 font-mono"><BilingualText zh={`共 ${filteredArticles.length} 篇`} en={`${filteredArticles.length} REPORTS`} /></span>
        </div>
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filteredArticles.map(article => <ArticleCard key={article.slug} article={article} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-500/10 bg-[#121520]/40 py-16 text-center text-gray-400">{loading ? <BilingualText zh="正在讀取文章…" en="LOADING REPORTS…" /> : <BilingualText zh="沒有找到符合此標籤的文章。" en="NO REPORTS MATCH THIS TAG." />}</div>
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
        <Suspense fallback={<div className="py-20 text-center text-cyan-400"><BilingualText zh="正在載入標籤分類..." en="LOADING TAG ARCHIVE..." /></div>}><TagsContent /></Suspense>
      </main>
      <Footer />
    </div>
  );
}
