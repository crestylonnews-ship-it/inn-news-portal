import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article, ArticleFrontmatter } from './types';
import { markdownToText } from './markdown';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

const keywordTags: Array<[string, string[]]> = [
  ['人工智慧', ['AI', '人工智慧', '科技']],
  ['AI', ['AI', '人工智慧', '科技']],
  ['量子', ['量子科技', '科技']],
  ['科技', ['科技']],
  ['醫療', ['醫療', '健康']],
  ['長照', ['高齡照護', '醫療', '社會']],
  ['高齡', ['高齡照護', '社會']],
  ['居住', ['居住正義', '住房']],
  ['租屋', ['居住正義', '住房']],
  ['房價', ['居住正義', '住房', '經濟']],
  ['勞工', ['勞動', '經濟']],
  ['工資', ['勞動', '經濟']],
  ['律師', ['法律', '職業'],],
  ['法律', ['法律']],
  ['教育', ['教育', '社會']],
  ['青年', ['青年', '社會']],
  ['平權', ['平權', '社會']],
  ['環境', ['環境']],
  ['公害', ['環境', '社會']],
  ['貿易', ['國際', '經濟']],
  ['協定', ['國際', '政策']],
  ['慈善', ['公益', '社會']],
  ['文化', ['文化']],
  ['音樂', ['文化', '教育']],
];

const categoryFallbackTags: Record<string, string[]> = {
  breaking: ['即時快訊'],
  'deep-dive': ['深度報導'],
  opinion: ['社論評論'],
  review: ['科技前沿'],
};

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[,，、|]/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function inferTags(title: string, content: string, category: string, explicitTags: string[]): string[] {
  const source = `${title} ${content}`.toLowerCase();
  const inferred = keywordTags
    .filter(([keyword]) => source.includes(keyword.toLowerCase()))
    .flatMap(([, tags]) => tags);
  const fallback = categoryFallbackTags[category] || ['新聞報導'];
  return Array.from(new Set([...explicitTags, ...inferred, ...fallback])).slice(0, 8);
}

function toArticle(filename: string): Article {
  const slug = filename.replace(/\.md$/, '');
  const fullPath = path.join(articlesDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents) as { data: ArticleFrontmatter; content: string };
  const title = String(data.title || '無標題新聞');
  const date = String(data.date || new Date().toISOString().split('T')[0]);
  const category = String(data.category || 'breaking');
  const plainText = markdownToText(content);
  const excerpt = String(data.excerpt || `${plainText.substring(0, 140)}${plainText.length > 140 ? '…' : ''}`);

  return {
    slug,
    title,
    date,
    category,
    author: String(data.author || '星際特派員'),
    tags: inferTags(title, plainText, category, normalizeArray(data.tags)),
    sources: normalizeArray(data.sources),
    content,
    excerpt,
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) return [];
  return fs.readdirSync(articlesDirectory)
    .filter(filename => filename.endsWith('.md'))
    .map(toArticle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  const safeSlug = path.basename(slug);
  const filename = `${safeSlug}.md`;
  const fullPath = path.join(articlesDirectory, filename);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return toArticle(filename);
  } catch {
    return null;
  }
}

export function getAllTags(): string[] {
  return Array.from(new Set(getAllArticles().flatMap(article => article.tags))).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

export function getTagStats(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  getAllArticles().forEach(article => article.tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant'));
}

export function searchArticles(query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllArticles();
  return getAllArticles().filter(article =>
    [article.title, article.content, article.author, ...article.tags].some(value => value.toLowerCase().includes(q)),
  );
}
