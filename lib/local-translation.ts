'use client';

export type ReadingLanguage =
  | 'zh-Hant'
  | 'en'
  | 'ja'
  | 'ko'
  | 'th'
  | 'vi'
  | 'id'
  | 'ms'
  | 'ar'
  | 'hi'
  | 'bn'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'ru'
  | 'it'
  | 'nl'
  | 'pl'
  | 'tr'
  | 'uk';

export interface LocalTranslationProgress {
  phase: 'catalogue' | 'download' | 'verify' | 'prepare' | 'translate' | 'complete';
  message: string;
  completedAssets?: number;
  totalAssets?: number;
  downloadedBytes?: number;
  totalBytes?: number;
}

type ProgressListener = (progress: LocalTranslationProgress) => void;
type TranslationOutput = Array<{ translation_text: string }>;
type TranslationPipeline = ((
  input: string | string[],
  options?: { max_new_tokens?: number; return_full_text?: boolean },
) => Promise<TranslationOutput>) & {
  dispose?: () => Promise<void> | void;
};

type TransformersModule = {
  env: {
    allowLocalModels?: boolean;
    allowRemoteModels?: boolean;
    useBrowserCache?: boolean;
  };
  pipeline: (
    task: 'translation',
    model: string,
    options?: { progress_callback?: (progress: { status?: string; file?: string; progress?: number; loaded?: number; total?: number }) => void },
  ) => Promise<TranslationPipeline>;
};

const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
const SOURCE_MODEL = 'Xenova/opus-mt-zh-en';
const TARGET_MODELS: Partial<Record<ReadingLanguage, string>> = {
  ja: 'Xenova/opus-mt-en-jap',
  ar: 'Xenova/opus-mt-en-ar',
  de: 'Xenova/opus-mt-en-de',
  es: 'Xenova/opus-mt-en-es',
  fr: 'Xenova/opus-mt-en-fr',
  hi: 'Xenova/opus-mt-en-hi',
  id: 'Xenova/opus-mt-en-id',
  nl: 'Xenova/opus-mt-en-nl',
  ru: 'Xenova/opus-mt-en-ru',
  uk: 'Xenova/opus-mt-en-uk',
  vi: 'Xenova/opus-mt-en-vi',
};
const PREFERRED_CHUNK_LENGTH = 420;

let transformersPromise: Promise<TransformersModule> | null = null;
const pipelines = new Map<string, Promise<TranslationPipeline>>();

function report(listener: ProgressListener | undefined, progress: LocalTranslationProgress) {
  listener?.(progress);
}

async function loadTransformers(): Promise<TransformersModule> {
  if (!transformersPromise) {
    transformersPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN) as Promise<TransformersModule>;
  }
  const module = await transformersPromise;
  module.env.allowLocalModels = false;
  module.env.allowRemoteModels = true;
  module.env.useBrowserCache = true;
  return module;
}

function progressText(progress: { status?: string; file?: string; progress?: number }): string {
  if (progress.status === 'ready') return '本機翻譯模型已就緒。';
  if (progress.status === 'done') return `已快取 ${progress.file || '模型檔'}。`;
  if (progress.status === 'progress') {
    const percentage = typeof progress.progress === 'number' ? ` ${Math.round(progress.progress)}%` : '';
    return `正在下載本機模型 ${progress.file || ''}${percentage}…`;
  }
  return '正在準備本機翻譯模型…';
}

async function getPipeline(modelId: string, listener?: ProgressListener): Promise<TranslationPipeline> {
  if (!pipelines.has(modelId)) {
    const module = await loadTransformers();
    pipelines.set(modelId, module.pipeline('translation', modelId, {
      progress_callback: progress => report(listener, {
        phase: progress.status === 'ready' ? 'prepare' : 'download',
        message: progressText(progress),
        downloadedBytes: progress.loaded,
        totalBytes: progress.total,
      }),
    }));
  }
  return pipelines.get(modelId) as Promise<TranslationPipeline>;
}

function splitForTranslation(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= PREFERRED_CHUNK_LENGTH) return [normalized];

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

async function translateText(text: string, translator: TranslationPipeline): Promise<string> {
  const chunks = splitForTranslation(text);
  if (!chunks.length) return text;
  const translated: string[] = [];
  for (const chunk of chunks) {
    const result = await translator(chunk, { max_new_tokens: 256, return_full_text: false });
    translated.push(result[0]?.translation_text?.trim() || chunk);
  }
  return translated.join(' ');
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

async function releasePipeline(modelId: string): Promise<void> {
  const pipeline = await pipelines.get(modelId)?.catch(() => null);
  try {
    await pipeline?.dispose?.();
  } finally {
    pipelines.delete(modelId);
  }
}

function supportedTargetModel(targetLanguage: ReadingLanguage): string | null {
  return TARGET_MODELS[targetLanguage] || null;
}

export async function getLocalTranslationEstimate(targetLanguage: ReadingLanguage): Promise<{ supported: boolean; bytes: number; label: string }> {
  if (targetLanguage === 'zh-Hant' || targetLanguage === 'en') return { supported: true, bytes: 0, label: '不需下載模型' };
  if (!supportedTargetModel(targetLanguage)) return { supported: false, bytes: 0, label: '此語言暫未提供可用的本機模型' };
  return {
    supported: true,
    bytes: 0,
    label: '首次約 70–100 MB；模型由瀏覽器快取，之後可離線重用',
  };
}

export async function translateChineseHtmlLocally(html: string, targetLanguage: ReadingLanguage, listener?: ProgressListener): Promise<string> {
  if (targetLanguage === 'zh-Hant') return html;
  if (targetLanguage === 'en') throw new Error('英文閱讀請使用網站既有英文版本。');

  const targetModel = supportedTargetModel(targetLanguage);
  if (!targetModel) throw new Error('此語言暫未提供可用的本機模型；你仍可閱讀原始中英內容。');

  report(listener, { phase: 'catalogue', message: '正在準備瀏覽器端開源翻譯模型…' });
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  const nodes = textNodesForTranslation(documentFragment);
  const englishSegments: string[] = [];

  // 一次只保留一套 ONNX 模型在記憶體：先轉為英文中介文字，再釋放第一套模型。
  // 這會拉長首次處理時間，卻能顯著降低手機與低記憶體裝置的崩潰機率。
  const sourceTranslator = await getPipeline(SOURCE_MODEL, listener);
  try {
    for (let index = 0; index < nodes.length; index += 1) {
      englishSegments.push(await translateText(nodes[index].textContent || '', sourceTranslator));
      report(listener, {
        phase: 'translate',
        message: `正在此裝置上準備英文中介稿 ${index + 1}/${nodes.length}…`,
        completedAssets: index + 1,
        totalAssets: nodes.length,
      });
    }
  } finally {
    await releasePipeline(SOURCE_MODEL);
  }

  const targetTranslator = await getPipeline(targetModel, listener);
  try {
    for (let index = 0; index < nodes.length; index += 1) {
      nodes[index].textContent = await translateText(englishSegments[index] || '', targetTranslator);
      report(listener, {
        phase: 'translate',
        message: `正在此裝置上翻譯文章 ${index + 1}/${nodes.length}…`,
        completedAssets: index + 1,
        totalAssets: nodes.length,
      });
    }
  } finally {
    await releasePipeline(targetModel);
  }

  report(listener, { phase: 'complete', message: '本地翻譯完成。' });
  return sanitizeTranslatedHtml(documentFragment.body.innerHTML);
}

export async function clearLocalTranslationModels(): Promise<void> {
  await Promise.all(Array.from(pipelines.keys()).map(releasePipeline));
  transformersPromise = null;
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.filter(name => /transformers|onnx/i.test(name)).map(name => caches.delete(name)));
}
