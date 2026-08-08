'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Article } from '@/lib/types';

function TagsContent() {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');

  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setArticles(data.articles);
          const tagSet = new Set<string>();
          data.articles.forEach((a: Article) => a.tags?.forEach((t: string) => tagSet.add(t)));
          setTags(Array.from(tagSet));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredArticles = selectedTag 
    ? articles.filter(article => article.tags?.includes(selectedTag))
    : articles;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
          ✦ TAG ARCHIVE ✦
        </div>
        <h1 className="text-4xl font-extrabold font-orbitron tracking-tight text-white">
          新聞標籤自動化分類
        </h1>
        <p className="text-gray-400">點擊下方標籤即可快速篩選相關星際新聞與深度報導。</p>
      </header>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-3 p-6 bg-[#121520]/80 border border-cyan-500/20 rounded-2xl shadow-[0_0_20px_rgba(0,191,255,0.05)]">
        <Link
          href="/tags"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !selectedTag 
              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] font-bold' 
              : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          全部新聞 ({articles.length})
        </Link>
        {tags.map(tag => {
          const count = articles.filter(a => a.tags?.includes(tag)).length;
          const isSelected = selectedTag === tag;
          return (
            <Link
              key={tag}
              href={`/tags?tag=${encodeURIComponent(tag)}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] font-bold'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              #{tag} ({count})
            </Link>
          );
        })}
      </div>

      {/* Filtered Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <h2 className="text-2xl font-bold font-orbitron text-cyan-400">
            {selectedTag ? `包含標籤 #${selectedTag} 的報導` : '所有星際報導'}
          </h2>
          <span className="text-xs text-gray-400 font-mono">共 {filteredArticles.length} 篇</span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-[#121520]/40 rounded-2xl border border-cyan-500/10">
            沒有找到符合此標籤的文章。
          </div>
        )}
      </div>
    </div>
  );
}

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 w-full py-12">
        <Suspense fallback={<div className="text-center py-20 text-cyan-400">正在載入標籤分類...</div>}>
          <TagsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
