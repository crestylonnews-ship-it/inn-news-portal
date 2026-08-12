import matter from 'gray-matter';
import { Article, ArticleFrontmatter } from './types';
import { markdownToText } from './markdown';

// 配置資訊
const GITHUB_OWNER = 'crestylonnews-ship-it';
const GITHUB_REPO = 'inn-news-portal';
const ARTICLES_PATH = 'content/articles';
// 在 Cloudflare Pages 環境中，應透過環境變數提供 Token 以提高 Rate Limit
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_INN || process.env.GITHUB_TOKEN;

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
  ['律師', ['法律', '職業']],
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

// 輔助函式：將 API 回傳的資料轉換為 Article 物件
function parseGitHubArticle(filename: string, fileContents: string): Article {
  const slug = filename.replace(/\.md$/, '');
  const { data, content } = matter(fileContents) as { data: ArticleFrontmatter; content: string };

  const title = String(data.title || '無標題新聞');
  const titleEn = String(data.titleEn || 'English edition unavailable');
  const date = String(data.date || new Date().toISOString().split('T')[0]);
  const category = String(data.category || 'breaking');
  const plainText = markdownToText(content);
  const excerpt = String(data.excerpt || `${plainText.substring(0, 140)}${plainText.length > 140 ? '…' : ''}`);
  const excerptEn = String(data.excerptEn || 'The English edition of this article is temporarily unavailable.');
  const contentEn = String(data.contentEn || '# English edition unavailable\n\nThe English edition of this article is temporarily unavailable.');

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
    content,
    contentEn,
    excerpt,
    excerptEn,
  };
}

// 封裝 GitHub API 調用
async function fetchFromGitHub(path: string) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 300 } // Edge 快取 5 分鐘
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.text();
}

export async function getAllArticles(): Promise<Article[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${ARTICLES_PATH}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 300 }
    });

    if (!response.ok) return [];
    const files = await response.json();
    
    if (!Array.isArray(files)) return [];

    // 為了效能，我們先只抓取列表資訊，內容在進入單頁時才抓取
    // 或者在此併發抓取前 20 篇以供首頁顯示
    const mdFiles = files.filter(f => f.name.endsWith('.md'));
    
    // 這裡我們只回傳基礎資訊，或者簡單的 Mock 以相容舊介面
    // 注意：getAllArticles 在 SSG 模式下會被頻繁調用，動態化後需謹慎處理
    // 我們可以先實作一個簡單的版本，僅抓取前 50 篇的完整內容
    const recentFiles = mdFiles.reverse().slice(0, 50);
    
    const articles = await Promise.all(recentFiles.map(async (file) => {
        const content = await fetchFromGitHub(`${ARTICLES_PATH}/${file.name}`);
        return content ? parseGitHubArticle(file.name, content) : null;
    }));

    return articles.filter((a): a is Article => a !== null).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const filename = `${slug}.md`;
    const content = await fetchFromGitHub(`${ARTICLES_PATH}/${filename}`);
    if (!content) return null;
    return parseGitHubArticle(filename, content);
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
