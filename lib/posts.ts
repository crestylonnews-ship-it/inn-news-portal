import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { Article, ArticleFrontmatter } from './types';
import { markdownToText } from './markdown';

// Cloudflare Pages 以 Git 內容為單一來源；建置時從已複製的文章目錄讀取。
const ARTICLES_DIRECTORY = join(process.cwd(), 'content', 'articles');
const SAFE_SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const keywordTags: Array<[string, string[]]> = [
  ['人工智慧', ['AI', '人工智慧', '科技']],
  ['AI', ['AI', '人工智慧', '科技']],
  ['量子', ['量子科技', '科技']],
  ['科技', ['科技']],
  ['醫療', ['醫療', '健康']],
  ['長照', ['高齡照護', '醫療', '社會']],
  ['高齡', ['高齡照護', '醫療', '社會']],
  ['居住', ['居住正義', '住房']],
  ['租屋', ['居住正義', '住房']],
  ['房價', ['居住正義', '住房', '經濟']],
  ['勞工', ['勞動', '經濟']],
  ['工資', ['勞動', '經濟']],
  ['律師', ['法律', '職業']],
  ['法律', ['法律']],
  ['教育', ['教育', '社會']],
  ['青年', ['青年', '社會']],
  ['平權', ['平權', '社會']],
  ['環境', ['環境', '社會']],
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
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, unknown>;
        return String(record.name || record.url || '').trim();
      }
      return String(item).trim();
    }).filter(Boolean);
  }
  if (typeof value === 'string') return value.split(/[,，、|]/).map(item => item.trim()).filter(Boolean);
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

function sanitizeFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw;
  const closingMarker = raw.indexOf('\n---', 3);
  if (closingMarker === -1) return raw;
  const header = raw.slice(0, closingMarker);
  const body = raw.slice(closingMarker);
  const quotedHeader = header.replace(/^(\s*[A-Za-z_][\w-]*:\s*)"(.*)"\s*$/gm, (_, prefix: string, value: string) => {
    // LLM 偶爾會在 YAML 雙引號字串內留下未跳脫的引號；以 JSON 字串格式重寫。
    return `${prefix}${JSON.stringify(value.replace(/\\"/g, '"'))}`;
  });
  const lines = quotedHeader.split('\n');
  let literalBlock = false;
  const normalizedLines = lines.map(line => {
    if (/^\s*[A-Za-z_][\w-]*:\s*[>|][-+]?\s*$/.test(line)) {
      literalBlock = true;
      return line;
    }
    if (literalBlock && line.trim() && !/^\s{2,}/.test(line)) {
      // contentEn: | 後方常有未縮排的 HTML；將它收回 YAML 字串區塊。
      return `  ${line}`;
    }
    return line;
  });
  return `${normalizedLines.join('\n')}${body}`;
}

function splitLegacyBilingualContent(content: string): { zh: string; en: string } | null {
  const archiveStart = content.search(/\n---\s*\n(?:###\s*\n---\s*\n)?## Global Archive\s*\/\s*英文存檔/i);
  if (archiveStart === -1) return null;
  const zh = content.slice(0, archiveStart)
    .replace(/^##\s+[A-Za-z][^\n]*\n/gm, '')
    .replace(/^>\s*\*[A-Za-z][^\n]*\*\s*\n?/gm, '')
    .trim();
  const en = content.slice(archiveStart)
    .replace(/^\n---\s*\n(?:###\s*\n---\s*\n)?## Global Archive\s*\/\s*英文存檔\s*\n?/i, '')
    .replace(/<details>\s*\n?<summary>[^\n]*<\/summary>\s*\n?/i, '')
    .replace(/<\/?div[^>]*>\s*\n?/gi, '')
    .replace(/<\/details>\s*\n?/gi, '')
    .replace(/^\*\*(原始來源|觀測站註記)[^\n]*\n?/gm, '')
    .replace(/^---\s*$/gm, '')
    .trim();
  return { zh, en };
}

function parseArticle(filename: string, fileContents: string): Article {
  const slug = filename.replace(/\.md$/, '');
  const { data, content } = matter(sanitizeFrontmatter(fileContents)) as { data: ArticleFrontmatter; content: string };
  const legacyContent = splitLegacyBilingualContent(content);
  const primaryContent = legacyContent?.zh || content;
  const title = String(data.title || '無標題新聞');
  const titleEn = String(data.titleEn || 'English edition unavailable');
  const date = String(data.date || new Date().toISOString().split('T')[0]);
  const category = String(data.category || 'breaking');
  const plainText = markdownToText(primaryContent);
  const excerpt = String(data.excerpt || `${plainText.substring(0, 140)}${plainText.length > 140 ? '…' : ''}`);
  const excerptEn = String(data.excerptEn || 'The English edition of this article is temporarily unavailable.');
  const contentEn = String(data.contentEn || legacyContent?.en || '# English edition unavailable\n\nThe English edition of this article is temporarily unavailable.');

  return {
    slug,
    title,
    titleEn,
    date,
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
    category,
    author: String(data.author || '星際特派員'),
    authorEn: String(data.authorEn || 'AI Editorial Desk'),
    tags: inferTags(title, plainText, category, normalizeArray(data.tags)),
    sources: normalizeArray(data.sources),
    content: primaryContent,
    contentEn,
    excerpt,
    excerptEn,
  };
}

export async function getAllArticles(): Promise<Article[]> {
  try {
    const entries = await readdir(ARTICLES_DIRECTORY, { withFileTypes: true });
    const markdownFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => entry.name);
    const parsedArticles = await Promise.all(markdownFiles.map(async filename => {
      try {
        const content = await readFile(join(ARTICLES_DIRECTORY, filename), 'utf8');
        return parseArticle(filename, content);
      } catch (error) {
        console.error(`Skipping invalid article ${filename}:`, error);
        return null;
      }
    }));
    return parsedArticles
      .filter((article): article is Article => article !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading local article content:', error);
    return [];
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    const entries = await readdir(ARTICLES_DIRECTORY, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => entry.name.replace(/\.md$/, ''))
      .filter(slug => SAFE_SLUG.test(slug));
  } catch (error) {
    console.error('Error reading local article slugs:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!SAFE_SLUG.test(slug)) return null;
  try {
    const content = await readFile(join(ARTICLES_DIRECTORY, `${slug}.md`), 'utf8');
    return parseArticle(`${slug}.md`, content);
  } catch {
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles();
  return Array.from(new Set(articles.flatMap(article => article.tags))).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

export async function getTagStats(): Promise<Array<{ tag: string; count: number }>> {
  const articles = await getAllArticles();
  const counts = new Map<string, number>();
  articles.forEach(article => article.tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant'));
}

export async function searchArticles(query: string): Promise<Article[]> {
  const articles = await getAllArticles();
  const q = query.trim().toLowerCase();
  if (!q) return articles;
  return articles.filter(article =>
    [article.title, article.titleEn, article.content, article.contentEn, article.author, article.authorEn, article.excerpt || '', article.excerptEn || '', ...article.tags].some(value => value.toLowerCase().includes(q)),
  );
}
