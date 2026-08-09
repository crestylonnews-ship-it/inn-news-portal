'use client';

import { useEffect, useState } from 'react';

function formatLocalTime(date: Date) {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

export default function LiveClock() {
  const [localTime, setLocalTime] = useState('--/--/-- --:--:--');

  useEffect(() => {
    const update = () => setLocalTime(formatLocalTime(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="live-clock" aria-label="本地即時日期時間">
      {localTime}
    </span>
  );
}
