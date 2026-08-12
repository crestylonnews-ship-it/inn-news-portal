import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllArticles } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import BilingualText from '@/components/BilingualText';

export default async function OpinionPage() {
  const articles = (await getAllArticles()).filter(a => a.category === 'opinion' || a.category === 'deep-dive');

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 w-full py-16 space-y-8">
        <h1 className="text-4xl font-extrabold font-orbitron text-cyan-400"><BilingualText zh="社論與深度評論" en="EDITORIAL & DEEP DIVE" /></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
