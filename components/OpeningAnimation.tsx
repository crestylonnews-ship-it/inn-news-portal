'use client';

import { useEffect, useState } from 'react';
import BilingualText from '@/components/BilingualText';

export default function OpeningAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="opening-screen" role="status" aria-live="polite" aria-label="INN 新聞終端正在啟動">
      <div className="opening-grid" aria-hidden="true" />
      <div className="opening-scanline" aria-hidden="true" />
      <div className="opening-content">
        <p className="opening-kicker"><BilingualText zh="INN NEWS / 系統啟動" en="INN NEWS / SYSTEM BOOT" /></p>
        <h2 className="opening-title"><BilingualText zh="星際聯邦新聞終端" en="STELLAR FEDERATION NEWS TERMINAL" block /></h2>
        <p className="opening-status"><BilingualText zh="正在同步多維新聞串流" en="SYNCING MULTI-DIMENSIONAL NEWS FEEDS" /><span className="opening-dots">...</span></p>
        <div className="opening-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
