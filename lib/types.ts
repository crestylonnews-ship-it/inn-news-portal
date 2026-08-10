export interface Article {
  slug: string;
  title: string;
  titleEn: string;
  date: string;
  publishedAt?: string;
  category: string;
  author: string;
  authorEn: string;
  tags: string[];
  sources: string[];
  content: string;
  contentEn: string;
  excerpt?: string;
  excerptEn?: string;
}
export interface ArticleFrontmatter {
  title?: string;
  titleEn?: string;
  date?: string;
  publishedAt?: string;
  category?: string;
  author?: string;
  authorEn?: string;
  tags?: string[] | string;
  sources?: string[] | string;
  excerpt?: string;
  excerptEn?: string;
  contentEn?: string;
}
