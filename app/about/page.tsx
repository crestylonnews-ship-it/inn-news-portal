import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText from '@/components/BilingualText';

const archiveProtocols = [
  {
    code: '01',
    title: '星曆校準',
    titleEn: 'STAR-DATE CALIBRATION',
    text: '每一則報導都以星曆校準，讓事件回到可追溯的時間座標。',
    textEn: 'Every report is aligned to a star-date, returning each event to a traceable time coordinate.'
  },
  {
    code: '02',
    title: '跨文明轉譯',
    titleEn: 'CROSS-CIVILIZATION TRANSLATION',
    text: '每一條訊息都經過跨文明語義轉譯，降低噪音，保留事件本身的訊號。',
    textEn: 'Every message passes through cross-civilization semantic translation to reduce noise and preserve the event signal.'
  },
  {
    code: '03',
    title: '同等信息重力',
    titleEn: 'EQUAL INFORMATIONAL GRAVITY',
    text: '從市井紛爭到國是論辯，從偏鄉暖意到制度困局，所有事件都值得被完整記錄。',
    textEn: 'From street disputes to national debate, from rural warmth to systemic deadlock, every event deserves a complete record.'
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
              <h1 className="page-hero-title"><BilingualText zh={<>關於 INN<br /><span>星際聯邦新聞網</span></>} en={<>ABOUT INN<br /><span>STELLAR FEDERATION NEWS</span></>} block /></h1>
              <p className="page-hero-lede"><BilingualText zh="新聞恆在，訊號不止。這裡是 INN 星際聯邦官方新聞網。" en="News endures. Signals continue. This is the INN Stellar Federation Official News Network." block /></p>
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
            <h2><BilingualText zh="一座運行於星際軌道的觀測站" en="AN ORBITAL OBSERVATION STATION" /></h2>
            <div className="about-copy">
              <p><BilingualText zh="這是一座運行於星際軌道的觀測站，將地表文明的權力更迭、社會事件與科技進展，悉數收攏進星聯的歸檔系統。" en="An observation station in interstellar orbit, gathering political shifts, social events and technological progress from surface civilization into the Federation archive." block /></p>
              <p><BilingualText zh="每一則報導都以星曆校準，每一條訊息都經過跨文明語義轉譯。在我們的紀錄裡，從市井紛爭到國是論辯，從偏鄉的片刻暖意到系統性的制度困局，所有事件享有同等的信息重力。" en="Each report is star-date calibrated and each message is semantically translated across civilizations. Our records give equal informational gravity to street disputes, national debate, rural warmth and systemic deadlock." block /></p>
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
              <h2><BilingualText zh="完整檔案，乾淨訊號" en="COMPLETE ARCHIVE, CLEAN SIGNAL" /></h2>
            </div>
            <span className="section-code">INN / PROTOCOL</span>
          </div>
          <div className="protocol-grid">
            {archiveProtocols.map((protocol) => (
              <article key={protocol.code} className="protocol-card">
                <span className="protocol-code">{protocol.code}</span>
                <h3><BilingualText zh={protocol.title} en={protocol.titleEn} /></h3>
                <p><BilingualText zh={protocol.text} en={protocol.textEn} block /></p>
              </article>
            ))}
          </div>
          <div className="about-copy about-closing-copy">
            <p><BilingualText zh="這裡沒有評論版的喧囂，也沒有社論的激昂。INN 提供的，是一套完整的檔案：頭條要聞、科技前沿、深度報導、時間線歸檔、標籤矩陣——所有欄目自動同步於星聯總署的資訊協定。" en="INN provides a complete archive: prime headlines, technology, deep dives, timeline records and a tag matrix, all synchronized with the Federation information protocol." block /></p>
            <p><BilingualText zh="你能讀到的，是事件被壓縮成訊號之後，最乾淨的波形。星際視角忠實記錄一個仍在為噪音、食安和停車場合法性而爭論不休的星球，正以什麼樣的方式，緩慢地學會與自己共存。" en="You read the cleanest waveform after events are compressed into signals. The interstellar perspective faithfully records how a planet still debating noise, food safety and parking-lot legality slowly learns to coexist with itself." block /></p>
          </div>
        </section>

        <section className="about-footer-cta mt-6 sm:mt-8">
          <div>
            <p className="eyebrow-label">ENTER THE ARCHIVE</p>
            <h2><BilingualText zh="從一則訊號開始，理解一個仍在學習共存的星球。" en="Begin with one signal. Read a planet learning to coexist." /></h2>
          </div>
          <div className="about-cta-links">
            <Link href="/" className="portal-card about-cta-card"><BilingualText zh="返回新聞終端" en="RETURN TO NEWS TERMINAL" /> <span>→</span></Link>
            <Link href="/timeline" className="portal-card about-cta-card"><BilingualText zh="查看時間線歸檔" en="OPEN TIMELINE ARCHIVE" /> <span>→</span></Link>
          </div>
        </section>

        <section className="about-link-section mt-6 sm:mt-8" aria-labelledby="inn-official-channels">
          <div className="about-link-section-header">
            <div>
              <p className="eyebrow-label">INN // OFFICIAL CHANNELS</p>
              <h2 id="inn-official-channels"><BilingualText zh="INN 官方連結" en="INN OFFICIAL CHANNELS" /></h2>
            </div>
            <p className="about-link-section-copy"><BilingualText zh="追蹤 INN 的官方社群帳號，接收最新訊號與公告。" en="Follow INN’s official channels for the latest signals and announcements." block /></p>
          </div>
          <div className="about-external-link-grid">
            <a href="https://www.instagram.com/inn.crestylon/" target="_blank" rel="noreferrer" className="about-external-link" aria-label="INN Instagram">
              <span className="about-link-platform">INSTAGRAM</span>
              <span className="about-link-handle">@inn.crestylon</span>
              <span className="about-link-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://www.threads.com/@inn.crestylon?hl=zh-tw" target="_blank" rel="noreferrer" className="about-external-link" aria-label="INN Threads">
              <span className="about-link-platform">THREADS</span>
              <span className="about-link-handle">@inn.crestylon</span>
              <span className="about-link-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://x.com/crestylon_news" target="_blank" rel="noreferrer" className="about-external-link" aria-label="INN X">
              <span className="about-link-platform">X</span>
              <span className="about-link-handle">@crestylon_news</span>
              <span className="about-link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="about-thanks-directory mt-6 sm:mt-8" aria-labelledby="acknowledgements-directory-title">
          <div>
            <p className="eyebrow-label">ACKNOWLEDGEMENTS ARCHIVE</p>
            <h2 id="acknowledgements-directory-title"><BilingualText zh="特別感謝，獨立歸檔" en="SPECIAL ACKNOWLEDGEMENTS, SEPARATELY ARCHIVED" /></h2>
            <p><BilingualText zh="所有支撐、閱讀、分享與協作的力量，皆已收錄於獨立的特別感謝頁面。" en="Every force of support, readership, sharing and collaboration is recorded on the dedicated acknowledgements page." block /></p>
          </div>
          <Link href="/acknowledgements" className="portal-card about-thanks-directory-link"><BilingualText zh="前往特別感謝" en="OPEN ACKNOWLEDGEMENTS" /> <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
