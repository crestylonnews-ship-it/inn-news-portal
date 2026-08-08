export interface Article {
  slug: string;
  title: string;
  date: string;
  category: 'breaking' | 'deep-dive' | 'opinion-expansion' | 'opinion-stability' | 'galactic-review' | 'cycle-report' | 'cold-eye';
  author: string;
  tags: string[];
  sources: string[];
  stance?: 'expansion' | 'stability';
  debate_id?: string;
  content: string;
  excerpt?: string;
}
