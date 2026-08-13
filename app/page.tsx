import { getAllArticles } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsMapExplorer from '@/components/NewsMapExplorer';
import OpeningAnimation from '@/components/OpeningAnimation';

// Cloudflare Pages static export：建置時同步最新內容，並由部署端重新建置更新。
export const dynamic = 'force-static';
export const revalidate = 300;

export default async function MapHomePage() {
  const articles = await getAllArticles();

  return (
    <div className="site-shell map-site-shell min-h-screen bg-[#0a0b0f] text-white selection:bg-cyan-500 selection:text-black font-sans">
      <OpeningAnimation />
      <Navbar />
      <main className="map-home-shell map-home-shell--fullscreen mx-auto w-full max-w-none px-0 py-0">
        <NewsMapExplorer articles={articles} home />
      </main>
      <Footer />
    </div>
  );
}
