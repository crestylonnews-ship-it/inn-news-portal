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

  useEffect(() => {
    if (query) {
      fetch('/api/articles')
        .then(res => res.json())
        .then(data => {
          if (data.articles) {
            const q = query.toLowerCase();
            const filtered = data.articles.filter((article: Article) => 
              article.title.toLowerCase().includes(q) ||
              article.content.toLowerCase().includes(q) ||
              article.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
              article.author.toLowerCase().includes(q)
            );
            setResults(filtered);
          }
        })
        .catch(err => console.error(err));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
          ✦ SEARCH RESULTS ✦
        </div>
        <h1 className="text-4xl font-extrabold font-orbitron tracking-tight text-white">
          搜尋結果：<span className="text-cyan-400">"{query}"</span>
        </h1>
        <p className="text-gray-400 font-mono">共找到 {results.length} 筆相關星際報導</p>
      </header>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#121520]/60 border border-cyan-500/20 rounded-2xl space-y-4">
          <p className="text-xl text-gray-300 font-orbitron">沒有找到與 "{query}" 相關的新聞</p>
          <p className="text-sm text-gray-500">請嘗試更換關鍵字或前往標籤分類頁面尋找。</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 w-full py-12">
        <Suspense fallback={<div className="text-center py-20 text-cyan-400">正在載入搜尋結果...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
