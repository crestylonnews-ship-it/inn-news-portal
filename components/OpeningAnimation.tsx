'use client';

import { useEffect, useState } from 'react';
import BilingualText from '@/components/BilingualText';

const OPENING_SESSION_KEY = 'inn-home-opening-played';

export default function OpeningAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const hasPlayed = window.sessionStorage.getItem(OPENING_SESSION_KEY) === 'true';

    if (reduceMotion || hasPlayed) {
      setVisible(false);
      return;
    }

    window.sessionStorage.setItem(OPENING_SESSION_KEY, 'true');
    const timer = window.setTimeout(() => setVisible(false), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="opening-screen" role="status" aria-live="polite" aria-label="INN 星際聯邦新聞終端正在啟動">
      <div className="opening-ambient" aria-hidden="true" />
      <div className="opening-stars" aria-hidden="true" />
      <div className="opening-grid" aria-hidden="true" />
      <div className="opening-scanline" aria-hidden="true" />
      <div className="opening-frame" aria-hidden="true" />

      <div className="opening-content">
        <div className="opening-readout opening-readout-top" aria-hidden="true">
          <span>INN // FEDERATION LINK</span>
          <span>CHANNEL 01 // MAP INDEX</span>
          <span>SECURE SIGNAL // ONLINE</span>
        </div>

        <div className="opening-core">
          <p className="opening-kicker"><BilingualText zh="INN NEWS / 系統啟動" en="INN NEWS / SYSTEM BOOT" /></p>
          <h2 className="opening-title"><BilingualText zh="星際聯邦新聞終端" en="STELLAR FEDERATION NEWS TERMINAL" block /></h2>
          <p className="opening-status"><BilingualText zh="正在同步多維新聞串流" en="SYNCING MULTI-DIMENSIONAL NEWS FEEDS" /><span className="opening-dots">...</span></p>
        </div>

        <div className="opening-progress-wrap" aria-hidden="true">
          <div className="opening-progress-label"><span>UPLINK PROGRESS</span><span>MAP SIGNALS / ARCHIVE / WORLD FEEDS</span></div>
          <div className="opening-progress"><span /></div>
        </div>

        <div className="opening-readout opening-readout-bottom" aria-hidden="true">
          <span>LANG // ZH-HANT + EN</span>
          <span>UTC+08 // NETWORK STABLE</span>
          <span>PRESSURE // NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
