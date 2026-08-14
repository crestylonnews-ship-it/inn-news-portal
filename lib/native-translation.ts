'use client';

import type { ReadingLanguage } from '@/lib/local-translation';

export type NativeTranslationProgress = {
  phase: 'availability' | 'download' | 'prepare' | 'translate' | 'complete';
  message: string;
  completedAssets?: number;
  totalAssets?: number;
  downloadedPercent?: number;
};

type ProgressListener = (progress: NativeTranslationProgress) => void;

type TranslatorAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable' | null;

type NativeTranslator = {
  translate: (input: string) => Promise<string>;
  destroy?: () => void | Promise<void>;
};

type NativeTranslatorApi = {
  availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<TranslatorAvailability>;
  create: (options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: EventTarget) => void;
  }) => Promise<NativeTranslator>;
};

const SOURCE_LANGUAGE = 'zh-Hant';
const CACHE_PREFIX = 'inn-native-translation:v1';
const PREFERRED_CHUNK_LENGTH = 520;
const sessionCache = new Map<string, string>();

function report(listener: ProgressListener | undefined, progress: NativeTranslationProgress) {
  listener?.(progress);
}

function getTranslatorApi(): NativeTranslatorApi | null {
  const candidate = (globalThis as typeof globalThis & { Translator?: NativeTranslatorApi }).Translator;
  return candidate && typeof candidate.availability === 'function' && typeof candidate.create === 'function' ? candidate : null;
}

export function supportsNativeTranslation(): boolean {
  return Boolean(getTranslatorApi());
}

export async function getNativeTranslationAvailability(targetLanguage: ReadingLanguage): Promise<TranslatorAvailability> {
  if (targetLanguage === SOURCE_LANGUAGE || targetLanguage === 'en') return 'available';
  const translator = getTranslatorApi();
  if (!translator) return 'unavailable';
  try {
    return await translator.availability({ sourceLanguage: SOURCE_LANGUAGE, targetLanguage });
  } catch {
    return null;
  }
}

function splitForTranslation(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length <= PREFERRED_CHUNK_LENGTH) return normalized ? [normalized] : [];

  const chunks: string[] = [];
  let remaining = normalized;
  while (remaining.length > PREFERRED_CHUNK_LENGTH) {
    const window = remaining.slice(0, PREFERRED_CHUNK_LENGTH + 1);
    const breakAt = Math.max(
      window.lastIndexOf('。'),
      window.lastIndexOf('！'),
      window.lastIndexOf('？'),
      window.lastIndexOf('；'),
      window.lastIndexOf('. '),
      window.lastIndexOf('; '),
      window.lastIndexOf(', '),
    );
    const end = breakAt > Math.floor(PREFERRED_CHUNK_LENGTH * 0.45) ? breakAt + 1 : PREFERRED_CHUNK_LENGTH;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function cacheKey(targetLanguage: ReadingLanguage, text: string): string {
  return `${CACHE_PREFIX}:${targetLanguage}:${hashText(text)}`;
}

function loadCachedTranslation(targetLanguage: ReadingLanguage, text: string): string | null {
  const key = cacheKey(targetLanguage, text);
  const inMemory = sessionCache.get(key);
  if (inMemory) return inMemory;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) sessionCache.set(key, stored);
    return stored;
  } catch {
    return null;
  }
}

function storeCachedTranslation(targetLanguage: ReadingLanguage, text: string, translation: string) {
  const key = cacheKey(targetLanguage, text);
  sessionCache.set(key, translation);
  try {
    window.localStorage.setItem(key, translation);
  } catch {
    // Storage may be unavailable or full. Session cache still keeps this page responsive.
  }
}

function textNodesForTranslation(documentFragment: Document): Text[] {
  const walker = documentFragment.createTreeWalker(documentFragment.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const parent = current.parentElement;
    if (parent && !['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(parent.tagName) && current.textContent?.trim()) {
      nodes.push(current as Text);
    }
    current = walker.nextNode();
  }
  return nodes;
}

function sanitizeTranslatedHtml(html: string): string {
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  const allowedTags = new Set(['A', 'BLOCKQUOTE', 'BR', 'CODE', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'UL']);
  const allowedAttributes = new Set(['href', 'title', 'rel']);

  const clean = (element: Element) => {
    Array.from(element.children).forEach(child => {
      if (!allowedTags.has(child.tagName)) {
        child.replaceWith(documentFragment.createTextNode(child.textContent || ''));
        return;
      }
      Array.from(child.attributes).forEach(attribute => {
        if (!allowedAttributes.has(attribute.name.toLowerCase())) child.removeAttribute(attribute.name);
      });
      if (child.tagName === 'A') {
        const href = child.getAttribute('href') || '';
        if (!/^(https?:|mailto:|#|\/)/i.test(href)) child.removeAttribute('href');
        child.setAttribute('rel', 'noopener noreferrer');
      }
      clean(child);
    });
  };

  clean(documentFragment.body);
  return documentFragment.body.innerHTML;
}

async function translateText(
  text: string,
  targetLanguage: ReadingLanguage,
  translator: NativeTranslator,
): Promise<string> {
  const cached = loadCachedTranslation(targetLanguage, text);
  if (cached) return cached;

  const chunks = splitForTranslation(text);
  const translated: string[] = [];
  for (const chunk of chunks) translated.push(await translator.translate(chunk));
  const result = translated.join(' ');
  storeCachedTranslation(targetLanguage, text, result);
  return result;
}

export async function translateChineseHtmlWithNativeApi(
  html: string,
  targetLanguage: ReadingLanguage,
  listener?: ProgressListener,
): Promise<string> {
  if (targetLanguage === SOURCE_LANGUAGE || targetLanguage === 'en') return html;
  const translatorApi = getTranslatorApi();
  if (!translatorApi) throw new Error('此瀏覽器不支援 Chrome 原生翻譯，將改用本機模型或保留原始中英內容。');

  report(listener, { phase: 'availability', message: '正在檢查 Chrome 本機翻譯語言包…' });
  const availability = await getNativeTranslationAvailability(targetLanguage);
  if (availability === 'unavailable' || availability === null) {
    throw new Error('Chrome 原生翻譯暫不支援這個語言組合。');
  }

  report(listener, { phase: availability === 'available' ? 'prepare' : 'download', message: availability === 'available' ? 'Chrome 本機翻譯語言包已就緒。' : 'Chrome 正在下載本機翻譯語言包…' });
  const translator = await translatorApi.create({
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage,
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', event => {
        const progressEvent = event as Event & { loaded?: number };
        const ratio = typeof progressEvent.loaded === 'number' ? Math.round(progressEvent.loaded * 100) : undefined;
        report(listener, {
          phase: 'download',
          message: ratio === undefined ? 'Chrome 正在下載本機翻譯語言包…' : `Chrome 正在下載本機翻譯語言包 ${ratio}%…`,
          downloadedPercent: ratio,
        });
      });
    },
  });

  try {
    const documentFragment = new DOMParser().parseFromString(html, 'text/html');
    const nodes = textNodesForTranslation(documentFragment);
    for (let index = 0; index < nodes.length; index += 1) {
      const source = nodes[index].textContent || '';
      nodes[index].textContent = await translateText(source, targetLanguage, translator);
      report(listener, {
        phase: 'translate',
        message: `正在透過 Chrome 本機翻譯文章 ${index + 1}/${nodes.length}…`,
        completedAssets: index + 1,
        totalAssets: nodes.length,
      });
    }
    report(listener, { phase: 'complete', message: 'Chrome 本機翻譯完成。' });
    return sanitizeTranslatedHtml(documentFragment.body.innerHTML);
  } finally {
    await translator.destroy?.();
  }
}
