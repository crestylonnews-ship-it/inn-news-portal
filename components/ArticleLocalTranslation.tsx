'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getLocalTranslationEstimate, translateChineseHtmlLocally, type LocalTranslationProgress } from '@/lib/local-translation';
import { readingLanguageLabel, readingLanguageNativeName } from '@/lib/reading-locale';
import { useReadingLocale } from '@/components/ReadingLocaleProvider';

export default function ArticleLocalTranslation({
  zhHtml,
  children,
}: {
  zhHtml: string;
  children: ReactNode;
}) {
  const { locale, configured } = useReadingLocale();
  const [translatedHtml, setTranslatedHtml] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<LocalTranslationProgress | null>(null);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState('');
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);

  const targetLanguage = locale.language;
  const requiresLocalTranslation = configured && targetLanguage !== 'zh-Hant' && targetLanguage !== 'en';

  useEffect(() => {
    setTranslatedHtml('');
    setShowTranslation(false);
    setBusy(false);
    setProgress(null);
    setError('');
    setEstimate('');
  }, [targetLanguage, zhHtml]);

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof memory === 'number') setDeviceMemory(memory);
  }, []);

  useEffect(() => {
    if (!requiresLocalTranslation) return;
    let active = true;
    getLocalTranslationEstimate(targetLanguage)
      .then(result => {
        if (!active) return;
        setEstimate(result.label);
        if (!result.supported) setError('此語言目前沒有可下載的本地模型；你仍可閱讀原始中英內容。');
      })
      .catch(() => {
        if (active) setEstimate('模型資訊將在開始翻譯時載入');
      });
    return () => { active = false; };
  }, [requiresLocalTranslation, targetLanguage]);

  const startTranslation = async () => {
    if (!requiresLocalTranslation || busy) return;
    setBusy(true);
    setError('');
    setProgress({ phase: 'catalogue', message: '正在準備本地翻譯模型…' });

    try {
      const translated = await translateChineseHtmlLocally(zhHtml, targetLanguage, nextProgress => setProgress(nextProgress));
      setTranslatedHtml(translated);
      setShowTranslation(true);
    } catch (nextError) {
      console.warn('INN 本地文章翻譯失敗：', nextError);
      setError(nextError instanceof Error ? nextError.message : '本地翻譯暫時無法完成，已保留原始中英內容。');
      setShowTranslation(false);
    } finally {
      setBusy(false);
    }
  };

  if (!requiresLocalTranslation) return <>{children}</>;

  const languageName = readingLanguageLabel(targetLanguage);
  const nativeName = readingLanguageNativeName(targetLanguage);
  const isRtl = targetLanguage === 'ar';
  const progressDetail = progress?.totalAssets
    ? ` ${progress.completedAssets || 0}/${progress.totalAssets}`
    : '';

  return (
    <div className="local-translation-wrap">
      <aside className="local-translation-panel" aria-live="polite">
        <div className="local-translation-copy">
          <span className="local-translation-kicker">ON-DEVICE TRANSLATION</span>
          <strong>以本機模型閱讀 {languageName} · {nativeName}</strong>
          <p>文章文字只在你的瀏覽器中處理，不會傳送到翻譯 API 或第三方伺服器。</p>
          {estimate && <small>{estimate}</small>}
          {deviceMemory !== null && deviceMemory <= 4 && (
            <small className="local-translation-resource-note">此裝置顯示約 {deviceMemory} GB 記憶體；長篇翻譯可能需要較久，請保持頁面開啟。原始中英內容會一直保留。</small>
          )}
        </div>
        <div className="local-translation-actions">
          {!showTranslation ? (
            <button type="button" className="local-translation-primary" onClick={startTranslation} disabled={busy || Boolean(error && estimate.includes('尚無'))}>
              {busy ? '正在本機翻譯…' : `翻譯為 ${nativeName}`}
            </button>
          ) : (
            <button type="button" className="local-translation-primary" onClick={() => setShowTranslation(false)}>
              顯示原始中英內容
            </button>
          )}
          {translatedHtml && !showTranslation && (
            <button type="button" className="local-translation-secondary" onClick={() => setShowTranslation(true)}>
              顯示 {nativeName} 譯文
            </button>
          )}
        </div>
        {busy && progress && (
          <div className="local-translation-progress">
            <span>{progress.message}{progressDetail}</span>
            <i aria-hidden="true" />
          </div>
        )}
        {error && <p className="local-translation-error">{error}</p>}
      </aside>

      {showTranslation && translatedHtml ? (
        <div
          className="markdown-body local-translation-output"
          lang={targetLanguage}
          dir={isRtl ? 'rtl' : 'auto'}
          dangerouslySetInnerHTML={{ __html: translatedHtml }}
        />
      ) : children}
    </div>
  );
}
