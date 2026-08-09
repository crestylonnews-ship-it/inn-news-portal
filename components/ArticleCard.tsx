import Link from 'next/link';
import { Article } from '@/lib/types';
import BilingualText from '@/components/BilingualText';
import { tagToEnglish } from '@/lib/i18n';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  compact?: boolean;
}

const categoryMeta: Record<string, { label: string; en: string; color: string }> = {
  breaking: { label: '即時快訊', en: 'BREAKING NEWS', color: 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(255,0,80,0.2)]' },
  'deep-dive': { label: '深度報導', en: 'DEEP DIVE', color: 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_10px_rgba(0,191,255,0.2)]' },
  opinion: { label: '社論專欄', en: 'EDITORIAL', color: 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
  review: { label: '科技前沿', en: 'TECH FRONTIER', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(0,255,255,0.2)]' },
};

function getMeta(category: string) {
  return categoryMeta[category] || {
    label: category || '新聞報導',
    en: 'NEWS REPORT',
    color: 'bg-slate-500/10 text-slate-300 border-slate-500/40',
  };
}

function Tags({ article, compact = false }: { article: Article; compact?: boolean }) {
  if (!article.tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="文章標籤 / Article tags">
      {article.tags.slice(0, compact ? 2 : 3).map(tag => (
        <span key={tag} className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 text-[10px] text-cyan-300/80">
          <BilingualText zh={`#${tag}`} en={`#${tagToEnglish(tag)}`} />
        </span>
      ))}
    </div>
  );
}

export default function ArticleCard({ article, featured = false, compact = false }: ArticleCardProps) {
  const meta = getMeta(article.category);

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} aria-label={`閱讀：${article.title}`} className="block h-full group">
        <div data-card="article" data-category={article.category} className="news-card featured-card relative h-full overflow-hidden rounded-2xl border border-cyan-500/40 bg-[#121520]/90 p-5 shadow-[0_0_40px_rgba(0,191,255,0.12)] backdrop-blur-2xl transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_60px_rgba(0,191,255,0.3)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-mono tracking-widest uppercase sm:text-xs ${meta.color}`}>
              <BilingualText zh={meta.label} en={meta.en} />
            </span>
            <span className="text-[11px] text-cyan-300/70 font-mono">STAR-DATE: {article.date}</span>
          </div>
          <h2 className="mb-4 text-2xl font-extrabold leading-tight text-white transition-colors group-hover:text-cyan-300 sm:text-3xl lg:text-5xl font-orbitron neon-title-glow">
            <BilingualText zh={article.title} en={article.titleEn} block />
          </h2>
          <p className="mb-5 line-clamp-4 text-base leading-relaxed text-gray-300 sm:text-lg"><BilingualText zh={article.excerpt || ''} en={article.excerptEn || article.excerpt || ''} block /></p>
          <Tags article={article} />
          <div className="mt-6 flex flex-col gap-3 border-t border-cyan-500/20 pt-5 text-xs font-mono sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span className="text-cyan-400"><BilingualText zh={`作者 / 記者: ${article.author}`} en={`AUTHOR: ${article.authorEn}`} /></span>
            <span className="font-bold tracking-wider text-cyan-400 transition-transform group-hover:translate-x-1"><BilingualText zh="閱讀全文 →" en="READ REPORT →" /></span>
          </div>
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link href={`/articles/${article.slug}`} aria-label={`閱讀：${article.title}`} className="block group">
        <div data-card="article" data-category={article.category} className="news-card compact-card rounded-xl border border-cyan-500/20 bg-[#121520]/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(0,191,255,0.2)]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase ${meta.color}`}><BilingualText zh={meta.label} en={meta.en} /></span>
            <span className="text-[11px] text-gray-400 font-mono">{article.date}</span>
          </div>
          <h4 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-cyan-300"><BilingualText zh={article.title} en={article.titleEn} block /></h4>
          <div className="mt-3"><Tags article={article} compact /></div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} aria-label={`閱讀：${article.title}`} className="block h-full group">
      <div data-card="article" data-category={article.category} className="news-card flex h-full flex-col justify-between rounded-xl border border-cyan-500/30 bg-[#121520]/80 p-5 shadow-[0_0_25px_rgba(0,191,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(0,191,255,0.2)] sm:p-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase sm:text-[11px] ${meta.color}`}><BilingualText zh={meta.label} en={meta.en} /></span>
            <span className="text-xs text-gray-400 font-mono">{article.date}</span>
          </div>
          <h3 className="mb-2.5 line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-cyan-300 font-orbitron"><BilingualText zh={article.title} en={article.titleEn} block /></h3>
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-300"><BilingualText zh={article.excerpt || ''} en={article.excerptEn || article.excerpt || ''} block /></p>
          <Tags article={article} />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-cyan-500/15 pt-4 text-xs font-mono">
          <span className="text-gray-400"><BilingualText zh={`作者：${article.author}`} en={`By ${article.authorEn}`} /></span>
          <span className="font-bold text-cyan-400 transition-transform group-hover:translate-x-1"><BilingualText zh="進入 →" en="ACCESS →" /></span>
        </div>
      </div>
    </Link>
  );
}
