import Link from 'next/link';

export default function TimelinePage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>時間線</h1>
      <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
        時間線功能開發中...
      </p>
      <div className="article-nav">
        <Link href="/" className="nav-link">← 返回首頁</Link>
      </div>
    </div>
  );
}
