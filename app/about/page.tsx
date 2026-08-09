import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const archiveProtocols = [
  {
    code: '01',
    title: '星曆校準',
    text: '每一則報導都以星曆校準，讓事件回到可追溯的時間座標。'
  },
  {
    code: '02',
    title: '跨文明轉譯',
    text: '每一條訊息都經過跨文明語義轉譯，降低噪音，保留事件本身的訊號。'
  },
  {
    code: '03',
    title: '同等信息重力',
    text: '從市井紛爭到國是論辯，從偏鄉暖意到制度困局，所有事件都值得被完整記錄。'
  }
];

export default function AboutPage() {
  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="content-shell flex-grow max-w-6xl mx-auto px-4 sm:px-6 w-full py-8 sm:py-14">
        <section className="page-hero about-hero animate-rise-in">
          <div className="page-hero-kicker">ABOUT INN // STATION MANIFEST</div>
          <div className="about-hero-grid">
            <div>
              <p className="eyebrow-label">OFFICIAL OBSERVATION STATION</p>
              <h1 className="page-hero-title">關於 INN<br /><span>星際聯邦新聞網</span></h1>
              <p className="page-hero-lede">新聞恆在，訊號不止。這裡是 INN 星際聯邦官方新聞網。</p>
            </div>
            <div className="about-orbit-mark" aria-hidden="true">
              <span className="orbit-ring orbit-ring-one" />
              <span className="orbit-ring orbit-ring-two" />
              <span className="orbit-core">INN</span>
            </div>
          </div>
        </section>

        <section className="about-manifesto-grid mt-6 sm:mt-8">
          <article className="about-manifesto-panel">
            <div className="panel-kicker">MISSION LOG // 0001</div>
            <h2>一座運行於星際軌道的觀測站</h2>
            <div className="about-copy">
              <p>這是一座運行於星際軌道的觀測站，將地表文明的權力更迭、社會事件與科技進展，悉數收攏進星聯的歸檔系統。</p>
              <p>每一則報導都以星曆校準，每一條訊息都經過跨文明語義轉譯。在我們的紀錄裡，從市井紛爭到國是論辯，從偏鄉的片刻暖意到系統性的制度困局，所有事件享有同等的信息重力。</p>
            </div>
          </article>

          <aside className="about-signal-panel">
            <div className="panel-kicker">SIGNAL STATUS</div>
            <div className="signal-status-line"><span className="status-dot" />ARCHIVE ONLINE</div>
            <div className="signal-status-line"><span className="status-dot status-dot-warm" />QUADRANT 04</div>
            <div className="signal-status-line"><span className="status-dot" />TRANSLATION READY</div>
            <div className="signal-readout">NOISE FILTER: ACTIVE<br />EVENT GRAVITY: EQUAL<br />RECORD MODE: CONTINUOUS</div>
          </aside>
        </section>

        <section className="about-section-block mt-6 sm:mt-8">
          <div className="section-heading-line">
            <div>
              <p className="eyebrow-label">ARCHIVE PRINCIPLES</p>
              <h2>不是喧囂，而是完整的檔案</h2>
            </div>
            <span className="section-code">INN / PROTOCOL</span>
          </div>
          <div className="protocol-grid">
            {archiveProtocols.map((protocol) => (
              <article key={protocol.code} className="protocol-card">
                <span className="protocol-code">{protocol.code}</span>
                <h3>{protocol.title}</h3>
                <p>{protocol.text}</p>
              </article>
            ))}
          </div>
          <div className="about-copy about-closing-copy">
            <p>這裡沒有評論版的喧囂，也沒有社論的激昂。INN 提供的，是一套完整的檔案：頭條要聞、科技前沿、深度報導、時間線歸檔、標籤矩陣——所有欄目自動同步於星聯總署的資訊協定。</p>
            <p>你能讀到的，是事件被壓縮成訊號之後，最乾淨的波形。星際視角無意拔高任何文明，它只是忠實地記錄一個仍在為噪音、食安和停車場合法性而爭論不休的星球，正以什麼樣的方式，緩慢地學會與自己共存。</p>
          </div>
        </section>

        <section className="about-footer-cta mt-6 sm:mt-8">
          <div>
            <p className="eyebrow-label">ENTER THE ARCHIVE</p>
            <h2>從一則訊號開始，理解一個仍在學習共存的星球。</h2>
          </div>
          <div className="about-cta-links">
            <Link href="/" className="portal-card about-cta-card">返回新聞終端 <span>→</span></Link>
            <Link href="/timeline" className="portal-card about-cta-card">查看時間線歸檔 <span>→</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
