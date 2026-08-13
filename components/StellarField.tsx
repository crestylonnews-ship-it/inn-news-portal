'use client';

import { useEffect } from 'react';

export default function StellarField() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      document.documentElement.style.setProperty('--stellar-scroll', progress.toFixed(4));
      document.documentElement.style.setProperty('--stellar-shift', `${Math.round(progress * 140)}px`);
      document.documentElement.style.setProperty('--stellar-shift-slow', `${Math.round(progress * -70)}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="stellar-field" aria-hidden="true">
      <div className="stellar-nebula stellar-nebula-a" />
      <div className="stellar-nebula stellar-nebula-b" />
      {Array.from({ length: 18 }, (_, index) => <span key={index} className="stellar-star" />)}
      <div className="stellar-frame stellar-frame-top" />
      <div className="stellar-frame stellar-frame-bottom" />
    </div>
  );
}
