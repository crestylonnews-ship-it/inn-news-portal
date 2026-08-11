import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
