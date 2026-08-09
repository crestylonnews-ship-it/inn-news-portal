export interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
  tags: string[];
  sources: string[];
  content: string;
  excerpt?: string;
}

export interface ArticleFrontmatter {
  title?: string;
  date?: string;
  category?: string;
  author?: string;
  tags?: string[] | string;
  sources?: string[] | string;
  excerpt?: string;
}
