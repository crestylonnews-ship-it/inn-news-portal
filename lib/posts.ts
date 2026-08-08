import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article } from './types';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export function getAllArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }
  const filenames = fs.readdirSync(articlesDirectory);
  const articles = filenames.filter(f => f.endsWith('.md')).map(filename => {
    const slug = filename.replace(/\.md$/, '');
    const fullPath = path.join(articlesDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '無標題新聞',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'breaking',
      author: data.author || '星際特派員',
      tags: data.tags || [],
      sources: data.sources || [],
      content,
      excerpt: data.excerpt || content.substring(0, 120) + '...',
    };
  });

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '無標題新聞',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'breaking',
      author: data.author || '星際特派員',
      tags: data.tags || [],
      sources: data.sources || [],
      content,
      excerpt: data.excerpt || content.substring(0, 120) + '...',
    };
  } catch (error) {
    return null;
  }
}
