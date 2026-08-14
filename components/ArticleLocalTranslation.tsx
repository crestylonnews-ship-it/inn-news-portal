'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getLocalTranslationEstimate, translateChineseHtmlLocally, type LocalTranslationProgress } from '@/lib/local-translation';
import {
  getNativeTranslationAvailability,
  supportsNativeTranslation,
  translateChineseHtmlWithNativeApi,
  type NativeTranslationProgress,
} from '@/lib/native-translation';
import { readingLanguageLabel, readingLanguageNativeName } from '@/lib/reading-locale';
import { useReadingLocale } from '@/components/ReadingLocaleProvider';

type TranslationProgress = LocalTranslationProgress | NativeTranslationProgress;
type NativeAvailability = 'checking' | 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unknown';
type TranslationEngine = 'chrome' | 'onnx' | null;

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
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState('');
  const [nativeAvailability, setNativeAvailability] = useState<NativeAvailability>('checking');
  const [engine, setEngine] = useState<TranslationEngine>(null);
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);

  const targetLanguage = locale.translationTarget;
  const requiresLocalTranslation = configured && targetLanguage !== 'zh-Hant' && targetLanguage !== 'en';
  const canTryChrome = nativeAvailability === 'available' || nativeAvailability === 'downloadable' || nativeAvailability === 'downloading';

  useEffect(() => {
    setTranslatedHtml('');
    setShowTranslation(false);
    setBusy(false);
    setProgress(null);
    setError('');
    setEstimate('');
    setEngine(null);
    setNativeAvailability('checking');
  }, [targetLanguage, zhHtml]);

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof memory === 'number') setDeviceMemory(memory);
  }, []);

  useEffect(() => {
    if (!requiresLocalTranslation) return;
    let active = true;

    if (!supportsNativeTranslation()) {
      setNativeAvailability('unavailable');
    } else {
      getNativeTranslationAvailability(targetLanguage)
        .then(result => {
          if (!active) return;
          if (result === 'available' || result === 'downloadable' || result === 'downloading') setNativeAvailability(result);
          else setNativeAvailability('unavailable');
        })
        .catch(() => {
          if (active) setNativeAvailability('unknown');
        });
    }

    getLocalTranslationEstimate(targetLanguage)
      .then(result => {
        if (!active) return;
        setEstimate(result.label);
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
    setProgress({ phase: 'availability', message: '正在檢查本機翻譯功能…' });

    let nativeFailure = '';
    if (canTryChrome) {
      try {
        setEngine('chrome');
        const translated = await translateChineseHtmlWithNativeApi(zhHtml, targetLanguage, nextProgress => setProgress(nextProgress));
        setTranslatedHtml(translated);
        setShowTranslation(true);
        return;
      } catch (nextError) {
        nativeFailure = nextError instanceof Error ? nextError.message : 'Chrome 原生翻譯暫時無法完成。';
      }
    }

    try {
      setEngine('onnx');
      setProgress({ phase: 'catalogue', message: nativeFailure ? 'Chrome 原生翻譯不可用，正在改用瀏覽器本機模型…' : '正在準備瀏覽器本機翻譯模型…' });
      const translated = await translateChineseHtmlLocally(zhHtml, targetLanguage, nextProgress => setProgress(nextProgress));
      setTranslatedHtml(translated);
      setShowTranslation(true);
    } catch (nextError) {
      console.warn('INN 本地文章翻譯失敗：', nextError);
      const fallbackError = nextError instanceof Error ? nextError.message : '本地翻譯暫時無法完成。';
      setError(nativeFailure ? `${nativeFailure} 已嘗試本機模型備援，但 ${fallbackError} 已保留原始中英內容。` : `${fallbackError} 已保留原始中英內容。`);
      setShowTranslation(false);
      setEngine(null);
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
  const chromeReady = nativeAvailability === 'available';
  const chromeDownload = nativeAvailability === 'downloadable' || nativeAvailability === 'downloading';

  return (
    <div className="local-translation-wrap">
      <aside className="local-translation-panel" aria-live="polite">
        <div className="local-translation-copy">
          <span className="local-translation-kicker">CHROME ON-DEVICE TRANSLATION</span>
          <strong>以本機翻譯閱讀 {languageName} · {nativeName}</strong>
          <p>優先使用 Chrome 內建翻譯模型；文章文字只在你的裝置處理，不會傳送到翻譯 API 或第三方伺服器。</p>
          <p className={`local-translation-engine-status${canTryChrome ? ' is-native' : ''}`}>
            {chromeReady && 'Chrome 原生翻譯語言包已就緒。'}
            {chromeDownload && '建議使用最新版桌面 Chrome；開始後會由 Chrome 下載並管理本機語言包。'}
            {nativeAvailability === 'checking' && '正在檢查 Chrome 原生翻譯功能…'}
            {(nativeAvailability === 'unavailable' || nativeAvailability === 'unknown') && '此瀏覽器未提供可用的 Chrome 原生翻譯，會改用 ONNX 本機模型；若仍不可用則保留中英原文。'}
          </p>
          {estimate && <small>{estimate}</small>}
          {deviceMemory !== null && deviceMemory <= 4 && (
            <small className="local-translation-resource-note">此裝置顯示約 {deviceMemory} GB 記憶體；長篇翻譯可能需要較久，請保持頁面開啟。原始中英內容會一直保留。</small>
          )}
        </div>
        <div className="local-translation-actions">
          {!showTranslation ? (
            <button type="button" className="local-translation-primary" onClick={startTranslation} disabled={busy || nativeAvailability === 'checking'}>
              {busy ? '正在本機翻譯…' : `${canTryChrome ? '使用 Chrome 本機翻譯' : '使用本機翻譯'}為 ${nativeName}`}
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
        {engine && showTranslation && <p className="local-translation-engine-used">本次譯文引擎：{engine === 'chrome' ? 'Chrome 原生 Translator API' : '瀏覽器 ONNX 本機模型'}。</p>}
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
