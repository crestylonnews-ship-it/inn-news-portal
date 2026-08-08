import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getLatestArticles, getArticlesByCategory } from '@/lib/posts';

export default async function Home() {
  const articles = await getLatestArticles();
  const deepDives = await getArticlesByCategory('deep-dive');
  const featured = articles[0];
  // 即時快訊直接連結最新新聞，並從首頁替換下來
  const replacedHeadline = articles[1]; // 最新被從頭版替換下來的新聞
  const breakingNews = articles.filter(a => a.category === 'breaking');
  // 優先顯示最新文章作為快訊，如果沒有則顯示最新的即時快訊
  const tickerArticle = replacedHeadline || (breakingNews.length > 0 ? breakingNews[0] : articles[1]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">⬢ INN ⬢</h1>
            <p className="hero-subtitle">星際聯邦官方新聞網</p>
            <p className="hero-desc">銀河系最炫技的新聞終端</p>
          </div>
        </div>
      </section>

      {/* Breaking News Ticker - 直接連結最新新聞 */}
      <section className="ticker-section">
        <div className="container">
          <div className="glass-panel glow-border ticker">
            <span className="ticker-label">● 即時快訊</span>
            <div className="ticker-content">
              {tickerArticle ? (
                <Link href={`/articles/${tickerArticle.slug}`} className="ticker-item">
                  <span className="ticker-prefix">⚡ 最新</span> {tickerArticle.title}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>


      {/* Featured Article */}
      {featured && (
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">頭條新聞</h2>
            <ArticleCard 
              article={featured} 
              featured 
            />
          </div>
        </section>
      )}

      {/* Latest Articles Grid */}
      <section className="articles-section">
        <div className="container">
          <h2 className="section-title">最新報導</h2>
          <div className="grid grid-3">
            {articles.slice(2, 8).map(article => (
              <ArticleCard 
                key={article.slug} 
                article={article}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="grid grid-2">
            {/* Deep Dives */}
            <div>
              <h3 className="category-title">深度報導</h3>
              <div className="category-list">
                {deepDives.slice(0, 3).map(article => (
                  <div key={article.slug} className="category-item glass-panel">
                    <p className="category-item-title">{article.title}</p>
                    <p className="category-item-author">by {article.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="category-title">快速導航</h3>
              <div className="category-list">
                <a href="/timeline" className="category-item glass-panel">
                  <span className="link-arrow">→</span> 時間線歸檔
                </a>
                <a href="/opinion" className="category-item glass-panel">
                  <span className="link-arrow">→</span> 社論與評論
                </a>
                <a href="/about" className="category-item glass-panel">
                  <span className="link-arrow">→</span> 關於本網
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>INN 星際新聞網 © 2026 | 星際聯邦官方媒體</p>
        </div>
      </footer>
    </div>
  );
}
