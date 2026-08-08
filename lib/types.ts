export interface Article {
  slug: string;
  title: string;
  date: string;
  category: 'breaking' | 'deep-dive' | 'opinion' | 'review';
  author: string;
  tags: string[];
  sources: string[];
  content: string;
  excerpt?: string;
}
