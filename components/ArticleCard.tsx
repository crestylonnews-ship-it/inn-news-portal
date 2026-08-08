'use client';

import Link from 'next/link';
import { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const categoryLabels: Record<Article['category'], string> = {
  'breaking': '即時快訊',
  'deep-dive': '深度報導',
  'opinion-expansion': '擴張派',
  'opinion-stability': '穩定派',
  'galactic-review': '銀河銳評',
  'cycle-report': '循環郵報',
  'cold-eye': '冷眼',
};

const categoryColors: Record<Article['category'], string> = {
  'breaking': 'text-red-400 border-red-400',
  'deep-dive': 'text-blue-400 border-blue-400',
  'opinion-expansion': 'text-orange-400 border-orange-400',
  'opinion-stability': 'text-purple-400 border-purple-400',
  'galactic-review': 'text-yellow-400 border-yellow-400',
  'cycle-report': 'text-green-400 border-green-400',
  'cold-eye': 'text-pink-400 border-pink-400',
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `星曆 ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`}>
        <div className="glass-panel glow-border p-8 hover:shadow-lg transition-all duration-300 float-on-hover cursor-pointer group">
          <div className="mb-4 flex items-center gap-2">
            <span className={`text-xs font-display font-bold px-3 py-1 border rounded ${categoryColors[article.category]}`}>
              {categoryLabels[article.category]}
            </span>
            <span className="text-xs text-cyan-400">{formatDate(article.date)}</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4 text-glow group-hover:text-cyan-400 transition-colors typewriter-text">
            {article.title}
          </h1>
          <p className="text-gray-300 mb-4 line-clamp-3">
            {article.excerpt || article.content.substring(0, 200).replace(/[#*`]/g, '')}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{article.author}</span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`}>
      <div className="glass-panel glow-border p-6 hover:shadow-lg transition-all duration-300 float-on-hover cursor-pointer group h-full">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-display font-bold px-2 py-1 border rounded ${categoryColors[article.category]}`}>
            {categoryLabels[article.category]}
          </span>
          <span className="text-xs text-cyan-400">{formatDate(article.date)}</span>
        </div>
        <h3 className="font-headline text-lg font-bold mb-2 text-glow group-hover:text-cyan-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
          {article.excerpt || article.content.substring(0, 100).replace(/[#*`]/g, '')}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{article.author}</span>
          <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
