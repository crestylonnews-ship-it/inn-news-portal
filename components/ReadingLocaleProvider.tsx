'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_READING_LOCALE,
  READING_LANGUAGES,
  READING_REGIONS,
  readingLanguageLabel,
  readingLanguageNativeName,
  type ReadingLocale,
  type ReadingRegion,
} from '@/lib/reading-locale';
import type { ReadingLanguage } from '@/lib/local-translation';

const STORAGE_KEY = 'inn-reading-locale';
const OPEN_SETTINGS_EVENT = 'inn-reading-locale-settings';

type ReadingLocaleContextValue = {
  locale: ReadingLocale;
  configured: boolean;
  setLocale: (locale: ReadingLocale) => void;
  openSettings: () => void;
};

const ReadingLocaleContext = createContext<ReadingLocaleContextValue | null>(null);

function isReadingLanguage(value: unknown): value is ReadingLanguage {
  return typeof value === 'string' && READING_LANGUAGES.some(language => language.code === value);
}

function isReadingRegion(value: unknown): value is ReadingRegion {
  return typeof value === 'string' && READING_REGIONS.some(region => region.code === value);
}

function readStoredLocale(): ReadingLocale | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ReadingLocale>;
    if (!isReadingRegion(value.region) || !isReadingLanguage(value.language)) return null;
    return { region: value.region, language: value.language };
  } catch {
    return null;
  }
}

function LocaleDialog({
  initialLocale,
  forced,
  onSave,
  onClose,
}: {
  initialLocale: ReadingLocale;
  forced: boolean;
  onSave: (locale: ReadingLocale) => void;
  onClose: () => void;
}) {
  const [region, setRegion] = useState<ReadingRegion>(initialLocale.region);
  const [language, setLanguage] = useState<ReadingLanguage>(initialLocale.language);

  useEffect(() => {
    setRegion(initialLocale.region);
    setLanguage(initialLocale.language);
  }, [initialLocale]);

  const updateRegion = (nextRegion: ReadingRegion) => {
    setRegion(nextRegion);
    const defaultLanguage = READING_REGIONS.find(item => item.code === nextRegion)?.defaultLanguage;
    if (defaultLanguage) setLanguage(defaultLanguage);
  };

  return (
    <div className="reading-locale-overlay" role="presentation">
      <section className="reading-locale-dialog" role="dialog" aria-modal="true" aria-labelledby="reading-locale-title">
        <div className="reading-locale-dialog-head">
          <span className="reading-locale-kicker">INN LOCAL READING</span>
          {!forced && (
            <button type="button" className="reading-locale-close" onClick={onClose} aria-label="關閉閱讀語言設定">×</button>
          )}
        </div>
        <h2 id="reading-locale-title">先選擇你的所在地區與閱讀語言</h2>
        <p>
          這項設定只儲存在你的裝置。INN NEWS 不會使用翻譯 API，也不會把文章文字傳送給翻譯服務。
          當你主動翻譯文章時，開源模型才會下載並在本機運算。
        </p>

        <label className="reading-locale-field">
          <span>所在地區</span>
          <select value={region} onChange={event => updateRegion(event.target.value as ReadingRegion)}>
            {READING_REGIONS.map(item => <option key={item.code} value={item.code}>{item.zh} · {item.en}</option>)}
          </select>
        </label>

        <label className="reading-locale-field">
          <span>優先閱讀語言</span>
          <select value={language} onChange={event => setLanguage(event.target.value as ReadingLanguage)}>
            {READING_LANGUAGES.map(item => <option key={item.code} value={item.code}>{item.zh} · {item.native}</option>)}
          </select>
        </label>

        <div className="reading-locale-privacy-note">
          <strong>{readingLanguageLabel(language)} · {readingLanguageNativeName(language)}</strong>
          <span>模型僅在你開始翻譯時下載。首次載入可能需要數十 MB；完成後可由同一瀏覽器快取重用。</span>
        </div>

        <button type="button" className="reading-locale-save" onClick={() => onSave({ region, language })}>
          儲存設定並繼續
        </button>
        <p className="reading-locale-footnote">你可隨時從導覽列的「閱讀語言」修改或清除本機模型。</p>
      </section>
    </div>
  );
}

export function ReadingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ReadingLocale>(DEFAULT_READING_LOCALE);
  const [configured, setConfigured] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) {
      setLocaleState(stored);
      setConfigured(true);
      document.documentElement.dataset.readingLanguage = stored.language;
    } else {
      setDialogOpen(true);
    }

    const open = () => setDialogOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const setLocale = (nextLocale: ReadingLocale) => {
    setLocaleState(nextLocale);
    setConfigured(true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocale));
    document.documentElement.dataset.readingLanguage = nextLocale.language;
    window.dispatchEvent(new Event('inn-reading-locale-change'));
  };

  const openSettings = () => setDialogOpen(true);
  const value = useMemo(() => ({ locale, configured, setLocale, openSettings }), [locale, configured]);

  return (
    <ReadingLocaleContext.Provider value={value}>
      {children}
      {dialogOpen && (
        <LocaleDialog
          initialLocale={locale}
          forced={!configured}
          onSave={nextLocale => {
            setLocale(nextLocale);
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </ReadingLocaleContext.Provider>
  );
}

export function useReadingLocale() {
  const context = useContext(ReadingLocaleContext);
  if (!context) throw new Error('useReadingLocale 必須在 ReadingLocaleProvider 中使用。');
  return context;
}

export function ReadingLocaleSettingsButton({ compact = false }: { compact?: boolean }) {
  const { locale, openSettings } = useReadingLocale();

  return (
    <button
      type="button"
      className={`reading-locale-settings${compact ? ' reading-locale-settings--compact' : ''}`}
      onClick={openSettings}
      aria-label="設定所在地區與閱讀語言"
      title="所在地區與閱讀語言"
    >
      <span className="reading-locale-settings-label">閱讀語言</span>
      <strong>{readingLanguageNativeName(locale.language)}</strong>
    </button>
  );
}
