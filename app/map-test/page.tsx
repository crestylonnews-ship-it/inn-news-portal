import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText from '@/components/BilingualText';
import NewsMapExplorer from '@/components/NewsMapExplorer';
import { getAllArticles } from '@/lib/posts';

export const dynamic = 'force-static';
export const revalidate = 300;

export default async function MapTestPage() {
  const articles = await getAllArticles();

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white selection:bg-cyan-500 selection:text-black font-sans">
      <Navbar />
      <main className="content-shell mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <header className="page-hero mb-8 space-y-4 sm:mb-10">
          <p className="page-kicker">EXPLORATION SPACE // GEO NEWS INDEX</p>
          <h1 className="page-title font-orbitron text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <BilingualText zh="地圖測試空間：由你選擇訊號" en="MAP LAB: YOU CHOOSE THE SIGNAL" />
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            <BilingualText
              zh="這是仍在測試中的地圖探索功能，不替你預設唯一的新聞路徑。拖曳、縮放、選擇地區或分類，從自己的方向理解近七日時事。"
              en="This is an experimental map exploration feature. Pan, zoom and choose a region or category to understand the last 7 days of current affairs on your own terms."
              block
            />
          </p>
          <div className="page-hero-line" aria-hidden="true" />
        </header>
        <NewsMapExplorer articles={articles} />
      </main>
      <Footer />
    </div>
  );
}
