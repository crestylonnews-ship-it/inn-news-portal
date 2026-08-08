// lib/posts.ts
import matter from 'gray-matter';
import { Article } from './types';

const articlesDirectory = 'content/articles';

// 僅在伺服器端執行的輔助函數
async function getFs() {
  if (typeof window === 'undefined') {
    return await import('fs');
  }
  return null;
}

async function getPath() {
  if (typeof window === 'undefined') {
    return await import('path');
  }
  return null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const fs = await getFs();
  const path = await getPath();
  
  if (!fs || !path) return null;

  try {
    const fullPath = path.join(process.cwd(), articlesDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'breaking',
      author: data.author || 'Anonymous',
      tags: data.tags || [],
      sources: data.sources || [],
      stance: data.stance,
      debate_id: data.debate_id,
      content,
      excerpt: data.excerpt,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const fs = await getFs();
  const path = await getPath();
  
  if (!fs || !path) return [];

  try {
    const fullDirectory = path.join(process.cwd(), articlesDirectory);
    if (!fs.existsSync(fullDirectory)) {
      return [];
    }

    const files = fs.readdirSync(fullDirectory).filter(file => file.endsWith('.md'));
    
    const articlesPromises = files.map(file => {
      const slug = file.replace(/\.md$/, '');
      return getArticleBySlug(slug);
    });

    const articles = (await Promise.all(articlesPromises)).filter((article): article is Article => article !== null);

    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading articles:', error);
    return [];
  }
}

export async function getArticlesByCategory(category: Article['category']): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter(article => article.category === category);
}

export async function getLatestArticles(count: number = 10): Promise<Article[]> {
  const all = await getAllArticles();
  return all.slice(0, count);
}

export async function getRelatedArticles(slug: string, limit: number = 3): Promise<Article[]> {
  const article = await getArticleBySlug(slug);
  if (!article) return [];

  const all = await getAllArticles();
  return all
    .filter(a => a.slug !== slug && a.category === article.category)
    .slice(0, limit);
}
