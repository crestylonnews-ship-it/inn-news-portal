import { marked } from 'marked';

const renderer = new marked.Renderer();

// 新聞內容只接受 Markdown 語法；原始 HTML 會被移除，避免內容檔意外破壞版面。
renderer.html = () => '';

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

const markdownBlockStart = /^\s{0,3}(?:#{1,6}\s|>\s?|[-*+]\s+|\d+[.)]\s+|```|~~~)/;

/**
 * Article files historically store each prose paragraph on its own line,
 * without requiring a blank line between paragraphs. Add those boundaries at
 * render time so the bilingual block aligner can pair Chinese and English
 * paragraphs without changing the publishing format.
 */
function normalizeArticleParagraphBreaks(markdown: string): string {
  const lines = String(markdown || '').trim().split(/\r?\n/);
  const normalized: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isFence = /^\s{0,3}(?:```|~~~)/.test(line);
    const previous = normalized[normalized.length - 1] || '';
    const canSplitPlainText = Boolean(
      previous.trim() && trimmed &&
      !inFence && !isFence &&
      !markdownBlockStart.test(previous) &&
      !markdownBlockStart.test(line),
    );

    if (canSplitPlainText) normalized.push('');
    normalized.push(line);

    if (isFence) inFence = !inFence;
  }

  return normalized.join('\n');
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(normalizeArticleParagraphBreaks(markdown), { async: false }) as string;
}

export function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
