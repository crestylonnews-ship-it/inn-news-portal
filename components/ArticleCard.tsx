import Link from 'next/link';
import { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const categoryLabels: Record<Article['category'], string> = {
  breaking: '即時快訊',
  'deep-dive': '深度報導',
  opinion: '社論專欄',
  review: '科技前沿',
};

const categoryColors: Record<Article['category'], string> = {
  breaking: 'bg-red-500/10 text-red-400 border-red-500/30',
  'deep-dive': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  opinion: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  review: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="block group">
        <div className="bg-[#121520]/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 md:p-10 shadow-[0_0_30px_rgba(0,191,255,0.08)] group-hover:border-cyan-400 group-hover:shadow-[0_0_40px_rgba(0,191,255,0.2)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold tracking-wide uppercase ${categoryColors[article.category]}`}>
              {categoryLabels[article.category]}
            </span>
            <span className="text-xs text-gray-400 font-mono">星曆 {article.date}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors leading-tight">
            {article.title}
          </h2>
          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-cyan-500/10 text-sm">
            <span className="text-cyan-400 font-medium">特派記者：{article.author}</span>
            <span className="text-cyan-400 group-hover:translate-x-2 transition-transform font-bold">閱讀全文 →</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className="block group h-full">
      <div className="bg-[#121520]/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 h-full flex flex-col justify-between shadow-[0_0_20px_rgba(0,191,255,0.05)] group-hover:border-cyan-400/60 group-hover:shadow-[0_0_25px_rgba(0,191,255,0.15)] transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold tracking-wide uppercase ${categoryColors[article.category]}`}>
              {categoryLabels[article.category]}
            </span>
            <span className="text-xs text-gray-400 font-mono">{article.date}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/10 text-xs">
          <span className="text-gray-400">{article.author}</span>
          <span className="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold">詳情 →</span>
        </div>
      </div>
    </Link>
  );
}
