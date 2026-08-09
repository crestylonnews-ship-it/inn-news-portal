import { marked } from 'marked';

const renderer = new marked.Renderer();

// 新聞內容只接受 Markdown 語法；原始 HTML 會被移除，避免內容檔意外破壞版面。
renderer.html = () => '';

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown.trim(), { async: false }) as string;
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
