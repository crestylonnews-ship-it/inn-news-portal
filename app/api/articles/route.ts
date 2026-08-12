import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/posts';

// Static export compatibility: the endpoint is generated at build time from the same GitHub article source.
export const dynamic = 'force-static';
export const revalidate = 300;

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
