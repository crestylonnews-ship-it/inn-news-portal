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
          <p className="page-kicker">TEST CHANNEL // GEO NEWS INTERFACE</p>
          <h1 className="page-title font-orbitron text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <BilingualText zh="地圖新聞測試" en="GEO NEWS MAP TEST" />
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            <BilingualText
              zh="這是獨立測試頁，不會取代首頁。請拖曳或縮放地圖，觀察新聞數量與內容如何依目前可見區域更新。"
              en="This is an independent test page and does not replace the homepage. Pan or zoom the map to see how report counts and content update with the visible region."
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
