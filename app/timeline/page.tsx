import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllArticles } from '@/lib/posts';
import Link from 'next/link';

export default function TimelinePage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 w-full py-16 space-y-8">
        <h1 className="text-4xl font-extrabold font-orbitron text-cyan-400">星曆時間線歸檔</h1>
        <div className="space-y-6 border-l-2 border-cyan-500/30 pl-6 ml-4">
          {articles.map((article) => (
            <div key={article.slug} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0a0b0f] border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors"></div>
              <span className="text-xs font-mono text-cyan-400">{article.date}</span>
              <h3 className="text-xl font-bold mt-1">
                <Link href={`/articles/${article.slug}`} className="hover:text-cyan-300 transition-colors">
                  {article.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-400 mt-1">{article.excerpt}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
