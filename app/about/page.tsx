import Link from 'next/link';
import '@/app/About.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        <h1 className="about-title">關於 INN 星際新聞網</h1>
        <section className="about-section glass-panel glow-border">
          <h2>我們的使命</h2>
          <p>
            INN 星際新聞網致力於為星際聯邦的公民提供最即時、最深入、最客觀的新聞報導。在浩瀚的宇宙中，資訊的流通是文明進步的基石。我們相信，透過公正的報導，能夠促進各星系之間的理解與合作，共同面對未來的挑戰。
          </p>
        </section>

        <section className="about-section glass-panel glow-border">
          <h2>我們的願景</h2>
          <p>
            成為星際聯邦最具影響力與公信力的新聞媒體。我們將持續探索新的報導形式與技術，將新聞傳遞到每一個角落，讓每一位公民都能夠掌握世界的脈動。
          </p>
        </section>

        <section className="about-section glass-panel glow-border">
          <h2>聯絡我們</h2>
          <p>
            如果您有任何疑問、建議或爆料，歡迎隨時與我們聯繫：
          </p>
          <ul>
            <li>**郵箱**：contact@inn-news.space</li>
            <li>**地址**：中立站，聯邦新聞大樓 42 層</li>
          </ul>
        </section>

        <div className="back-to-home">
          <Link href="/" className="nav-link">← 返回首頁</Link>
        </div>
      </div>
    </div>
  );
}
