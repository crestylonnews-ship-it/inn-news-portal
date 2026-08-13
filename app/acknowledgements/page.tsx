import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualText from '@/components/BilingualText';

const acknowledgements = [
  {
    code: '01',
    label: 'INFRASTRUCTURE // FOUNDATION',
    title: 'Cloudflare 免費層',
    titleEn: 'CLOUDFLARE FREE TIER',
    text: '感謝 Cloudflare 免費層提供穩定的起點，讓這座新聞檔案庫能持續向每一位讀者開放。',
    textEn: 'Thank you to the Cloudflare Free Tier for providing a dependable starting point that keeps this news archive open to every reader.'
  },
  {
    code: '02',
    label: 'AUDIENCE // WITNESSES',
    title: '所有觀看者',
    titleEn: 'EVERY VIEWER',
    text: '感謝每一位停下來閱讀、比對與思考的觀看者。你們讓每一則被記錄的訊號，成為可被理解的公共記憶。',
    textEn: 'Thank you to every viewer who pauses to read, compare and reflect. You turn each recorded signal into public memory that can be understood.'
  },
  {
    code: '03',
    label: 'OUTREACH // SIGNAL RELAY',
    title: '協助推廣者',
    titleEn: 'COMMUNITY PROMOTERS',
    text: '感謝所有協助分享、轉傳與介紹 INN 的推廣者，讓值得被看見的事件跨越原本的資訊邊界。',
    textEn: 'Thank you to everyone who shares, relays and introduces INN, helping events that deserve attention cross their original information boundaries.'
  }
];

const freeResources = [
  {
    code: 'OPEN',
    label: 'COMMONS // OPEN TECHNOLOGY',
    title: '所有開源與免費技術',
    titleEn: 'OPEN-SOURCE & FREE TECHNOLOGY',
    text: '感謝所有開源專案、免費工具與公開技術社群。每一個被共享、維護與改良的基礎元件，都讓獨立資訊工作有更多可行的起點。',
    textEn: 'Thank you to every open-source project, free tool and public technology community. Each shared, maintained and improved building block gives independent information work more possible starting points.'
  },
  {
    code: 'SEARCH',
    label: 'DISCOVERY // SEARCH RESOURCE',
    title: 'DuckDuckGo',
    titleEn: 'DUCKDUCKGO',
    text: '感謝 DuckDuckGo 等搜尋資源，協助資訊查找、議題探索與來源發現。',
    textEn: 'Thank you to DuckDuckGo and other search resources that support information lookup, topic discovery and source finding.',
    url: 'https://duckduckgo.com/',
    domain: 'duckduckgo.com'
  },
  {
    code: 'NEWS',
    label: 'SIGNAL // NEWS DATA RESOURCE',
    title: 'NewsAPI',
    titleEn: 'NEWSAPI',
    text: '感謝 NewsAPI 等新聞與資料資源，讓即時訊號得以被彙整、追蹤與持續理解。',
    textEn: 'Thank you to NewsAPI and other news and data resources that help real-time signals be gathered, tracked and continuously understood.',
    url: 'https://newsapi.org/',
    domain: 'newsapi.org'
  },
  {
    code: 'REPO',
    label: 'REPOSITORY // COLLABORATION',
    title: 'GitHub 倉庫功能',
    titleEn: 'GITHUB REPOSITORY FEATURES',
    text: '感謝 GitHub 倉庫功能支援版本管理、內容協作與部署流程，讓這座新聞網的更新可以被持續維護與追溯。',
    textEn: 'Thank you to GitHub repository features for supporting version control, content collaboration and deployment workflows, keeping this news network maintainable and traceable over time.',
    url: 'https://github.com/crestylonnews-ship-it/inn-news-portal',
    domain: 'github.com/crestylonnews-ship-it/inn-news-portal'
  }
];

const aiContributors = [
  { name: 'MANUS AI', url: 'https://manus.im/' },
  { name: 'DEEPSEEK', url: 'https://www.deepseek.com/' },
  { name: 'CHATGPT', url: 'https://chatgpt.com/' },
  { name: 'GEMINI', url: 'https://gemini.google.com/' },
  { name: 'META', url: 'https://www.meta.ai/' }
];

const developers = [
  {
    name: 'SUNGYAN WORKSHOP',
    url: 'https://sungyan-workshop.pages.dev/',
    domain: 'sungyan-workshop.pages.dev',
    avatar: '/participants/sungyan-workshop-avatar.webp',
    role: '協助開發者',
    roleEn: 'DEVELOPMENT CONTRIBUTOR'
  },
  {
    name: 'AUDITORS ARCHIVE',
    url: 'https://auditors-archive.pages.dev/',
    domain: 'auditors-archive.pages.dev',
    avatar: '/participants/auditors-archive-avatar.webp',
    role: '協助開發者',
    roleEn: 'DEVELOPMENT CONTRIBUTOR'
  }
];

export default function AcknowledgementsPage() {
  return (
    <div className="site-shell min-h-screen bg-[#0a0b0f] text-white flex flex-col font-sans">
      <Navbar />
      <main className="content-shell flex-grow mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        <section className="acknowledgements-hero" aria-labelledby="acknowledgements-title">
          <div className="acknowledgements-hero-copy">
            <p className="page-hero-kicker">INN // ACKNOWLEDGEMENTS ARCHIVE</p>
            <p className="eyebrow-label">SIGNALS ARE NEVER CARRIED ALONE</p>
            <h1 id="acknowledgements-title" className="acknowledgements-title"><BilingualText zh="特別感謝" en="SPECIAL ACKNOWLEDGEMENTS" block /></h1>
            <p className="acknowledgements-lede"><BilingualText zh="每一則抵達讀者眼前的訊號，都承載著基礎服務、閱讀、分享與協作的善意。" en="Every signal that reaches a reader carries the goodwill of infrastructure, attention, sharing and collaboration." block /></p>
          </div>
          <aside className="acknowledgements-hero-resources" aria-labelledby="hero-resources-title">
            <p className="hero-resources-kicker">THE OPEN COMMONS // GRATITUDE</p>
            <h2 id="hero-resources-title"><BilingualText zh="開源與免費資源" en="OPEN-SOURCE & FREE RESOURCES" /></h2>
            <div className="hero-resource-list">
              {freeResources.map((resource) => {
                const content = <>
                  <span className="hero-resource-code">{resource.code}</span>
                  <span className="hero-resource-copy">
                    <strong><BilingualText zh={resource.title} en={resource.titleEn} /></strong>
                    {resource.domain && <small>{resource.domain}</small>}
                  </span>
                  {resource.url && <span className="hero-resource-arrow" aria-hidden="true">↗</span>}
                </>;
                return resource.url ? (
                  <a key={resource.code} href={resource.url} target="_blank" rel="noreferrer" className="hero-resource-item" aria-label={resource.titleEn}>{content}</a>
                ) : (
                  <div key={resource.code} className="hero-resource-item">{content}</div>
                );
              })}
            </div>
            <div className="hero-ai-contributors" aria-label="AI 協作工具致謝">
              <span><BilingualText zh="感謝協作 AI 工具" en="AI COLLABORATORS THANKED" /></span>
              <div className="hero-ai-contributor-list">
                {aiContributors.map((contributor) => (
                  <a key={contributor.name} href={contributor.url} target="_blank" rel="noreferrer">{contributor.name}<i aria-hidden="true">↗</i></a>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="acknowledgement-grid mt-6 sm:mt-8" aria-label="特別感謝項目">
          {acknowledgements.map((item) => (
            <article key={item.code} className="acknowledgement-card">
              <div className="acknowledgement-card-meta">
                <span>{item.code}</span>
                <span>{item.label}</span>
              </div>
              <h2><BilingualText zh={item.title} en={item.titleEn} /></h2>
              <p><BilingualText zh={item.text} en={item.textEn} block /></p>
            </article>
          ))}
        </section>

        <section className="developer-thanks-section mt-6 sm:mt-8" aria-labelledby="developer-thanks-title">
          <div className="developer-thanks-heading">
            <div>
              <p className="eyebrow-label">SPECIAL RECOGNITION // DEVELOPMENT</p>
              <h2 id="developer-thanks-title"><BilingualText zh="特別感謝協助開發者" en="SPECIAL THANKS TO DEVELOPMENT CONTRIBUTORS" /></h2>
            </div>
            <p><BilingualText zh="感謝兩位協助開發者，以創作、測試與協作，讓這座資訊觀測站持續向前。" en="With gratitude to two development contributors whose creation, testing and collaboration keep this information observatory moving forward." block /></p>
          </div>
          <div className="developer-thanks-grid">
            {developers.map((developer) => (
              <a key={developer.url} href={developer.url} target="_blank" rel="noreferrer" className="developer-thanks-card" aria-label={developer.name}>
                <span className="developer-avatar" aria-hidden="true">
                  <img src={developer.avatar} alt="" width="256" height="256" loading="lazy" />
                </span>
                <span className="developer-card-copy">
                  <span className="developer-role"><BilingualText zh={developer.role} en={developer.roleEn} /></span>
                  <strong>{developer.name}</strong>
                  <span className="developer-domain">{developer.domain}</span>
                </span>
                <span className="developer-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="acknowledgements-return mt-6 sm:mt-8">
          <div>
            <p className="eyebrow-label">RETURN TO THE OBSERVATION STATION</p>
            <h2><BilingualText zh="感謝每一道讓訊號持續前行的力量。" en="Thank you for every force that keeps the signal moving." /></h2>
          </div>
          <Link href="/" className="portal-card acknowledgements-return-link"><BilingualText zh="返回地圖首頁" en="RETURN TO MAP HOME" /> <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
