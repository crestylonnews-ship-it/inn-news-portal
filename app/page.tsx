import Link from 'next/link';
import { getAllArticles } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText from '@/components/BilingualText';
import NewsMapExplorer from '@/components/NewsMapExplorer';

// Cloudflare Pages static export：建置時同步最新內容，並由部署端重新建置更新。
export const dynamic = 'force-static';
export const revalidate = 300;

export default async function MapHomePage() {
  const articles = await getAllArticles();

  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white selection:bg-cyan-500 selection:text-black font-sans">
      <Navbar />
      <main className="map-home-shell mx-auto w-full max-w-[96rem] px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="map-home-hero" aria-labelledby="map-home-title">
          <div className="map-home-hero-copy">
            <p className="map-eyebrow"><BilingualText zh="開啟視角 // 即時地理新聞" en="OPENING VIEW // LIVE GEO NEWS" /></p>
            <h1 id="map-home-title" className="map-home-title font-orbitron text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              <BilingualText zh="從地圖開始，看見今天正在發生什麼。" en="START WITH THE MAP. SEE WHAT IS HAPPENING TODAY." />
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              <BilingualText
                zh="地圖現在是本網的第一個開啟畫面。先讀各區今日事件摘要，再依地區、領域與語言決定要追蹤哪一道訊號。"
                en="The map is now the opening view of this network. Read today’s regional briefings first, then choose the regions, topics and language you want to follow."
                block
              />
            </p>
          </div>
          <div className="map-home-hero-actions" aria-label="探索入口">
            <Link href="/classic-home" className="map-home-action map-home-action-primary"><BilingualText zh="前往傳統首頁 →" en="CLASSIC HOME →" /></Link>
            <Link href="/tags" className="map-home-action"><BilingualText zh="主題索引" en="TOPIC INDEX" /></Link>
            <Link href="/timeline" className="map-home-action"><BilingualText zh="時事時間線" en="TIMELINE" /></Link>
          </div>
        </header>

        <NewsMapExplorer articles={articles} home />
      </main>
      <Footer />
    </div>
  );
}
