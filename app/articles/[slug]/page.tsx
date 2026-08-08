import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles, getAllArticles } from '@/lib/posts';
import { Article } from '@/lib/types';
import ArticleCard from '@/components/ArticleCard';
import '@/app/Article.css';

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const relatedArticles = await getRelatedArticles(slug);

  return (
    <div className="article-page">
      <article className="article-content">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/">首頁</Link>
            <span> / </span>
            <span>{categoryLabels[article.category]}</span>
          </div>

          {/* Article Header */}
          <div className="article-header-section">
            <span className="article-category-badge">{categoryLabels[article.category]}</span>
            <h1 className="article-title">{article.title}</h1>
            
            <div className="article-meta glass-panel">
              <div className="meta-item">
                <span className="meta-label">發布日期</span>
                <span className="meta-value">{formatDate(article.date)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">作者</span>
                <span className="meta-value">{article.author}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">分類</span>
                <span className="meta-value">{categoryLabels[article.category]}</span>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="article-body glass-panel glow-border">
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Tags */}
          <div className="article-tags">
            {article.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          {/* Sources */}
          {article.sources.length > 0 && (
            <div className="article-sources glass-panel">
              <h3>資料來源</h3>
              <ul>
                {article.sources.map((source, idx) => (
                  <li key={idx}>{source}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="related-articles">
              <h2>相關文章</h2>
              <div className="grid grid-3">
                {relatedArticles.map(related => (
                  <ArticleCard 
                    key={related.slug} 
                    article={related}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="article-nav">
            <Link href="/" className="nav-link">← 返回首頁</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
