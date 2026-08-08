import Link from 'next/link';
import { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  compact?: boolean;
}

const categoryMeta: Record<Article['category'], { label: string; en: string; color: string }> = {
  breaking: { label: '即時快訊', en: 'BREAKING NEWS', color: 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(255,0,80,0.2)]' },
  'deep-dive': { label: '深度報導', en: 'DEEP DIVE', color: 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_10px_rgba(0,191,255,0.2)]' },
  opinion: { label: '社論專欄', en: 'EDITORIAL', color: 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
  review: { label: '科技前沿', en: 'TECH FRONTIER', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(0,255,255,0.2)]' },
};

export default function ArticleCard({ article, featured = false, compact = false }: ArticleCardProps) {
  const meta = categoryMeta[article.category] || categoryMeta.breaking;

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="block group">
        <div className="bg-[#121520]/90 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(0,191,255,0.12)] group-hover:border-cyan-400 group-hover:shadow-[0_0_60px_rgba(0,191,255,0.3)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-3.5 py-1 rounded-full border font-mono tracking-widest uppercase ${meta.color}`}>
              {meta.label} // {meta.en}
            </span>
            <span className="text-xs text-cyan-300/70 font-mono">STAR-DATE: {article.date}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 group-hover:text-cyan-300 transition-colors leading-tight font-orbitron neon-title-glow">
            {article.title}
          </h2>
          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3 leading-relaxed font-serif">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between pt-6 border-t border-cyan-500/20 text-sm font-mono">
            <span className="text-cyan-400">AUTHOR / 記者: {article.author}</span>
            <span className="text-cyan-400 group-hover:translate-x-2 transition-transform font-bold tracking-wider flex items-center gap-1">
              READ REPORT / 閱讀全文 →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link href={`/articles/${article.slug}`} className="block group">
        <div className="bg-[#121520]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(0,191,255,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">{article.date}</span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className="block group h-full">
      <div className="bg-[#121520]/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 h-full flex flex-col justify-between shadow-[0_0_25px_rgba(0,191,255,0.06)] group-hover:border-cyan-400 group-hover:shadow-[0_0_35px_rgba(0,191,255,0.2)] transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono tracking-wider uppercase ${meta.color}`}>
              {meta.label} // {meta.en}
            </span>
            <span className="text-xs text-gray-400 font-mono">{article.date}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug font-orbitron">
            {article.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed font-serif">
            {article.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/15 text-xs font-mono">
          <span className="text-gray-400">By {article.author}</span>
          <span className="text-cyan-400 group-hover:translate-x-1 transition-transform font-bold">ACCESS →</span>
        </div>
      </div>
    </Link>
  );
}
