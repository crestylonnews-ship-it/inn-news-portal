import { Octokit } from 'octokit';
import { NextRequest, NextResponse } from 'next/server';

interface ArticleData {
  title: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  sources: string[];
  content: string;
}

interface DeleteRequest {
  slug: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

const getOctokit = () => {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub credentials not configured');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
};

export async function POST(request: NextRequest) {
  try {
    const data: ArticleData = await request.json();

    if (!data.title || !data.content || !data.author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const octokit = getOctokit();

    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const fileName = `${data.date}-${slug}.md`;
    const filePath = `content/articles/${fileName}`;

    const frontmatter = `---
title: "${data.title}"
date: "${data.date}"
category: "${data.category}"
author: "${data.author}"
tags: [${data.tags.map(t => `"${t}"`).join(', ')}]
sources: [${data.sources.map(s => `"${s}"`).join(', ')}]
---

${data.content}`;

    let sha = '';
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: GITHUB_OWNER!,
        repo: GITHUB_REPO!,
        path: filePath,
      });
      if (
        fileData &&
        !Array.isArray(fileData) &&
        'sha' in fileData &&
        typeof fileData.sha === 'string'
      ) {
        sha = fileData.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Error getting file SHA:', error);
        throw error;
      }
    }

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER!,
      repo: GITHUB_REPO!,
      path: filePath,
      message: `Add article: ${data.title}`,
      content: Buffer.from(frontmatter).toString('base64'),
      ...(sha && { sha }),
    });

    return NextResponse.json({
      success: true,
      message: 'Article published successfully',
      commit_sha: response.data.commit.sha,
      file_path: filePath,
    });
  } catch (error: any) {
    console.error('Error in POST /api/commit:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug }: DeleteRequest = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const octokit = getOctokit();

    const files = await octokit.rest.repos.getContent({
      owner: GITHUB_OWNER!,
      repo: GITHUB_REPO!,
      path: 'content/articles',
    });

    let fileToDelete: { path: string; sha: string } | undefined;
    if (Array.isArray(files.data)) {
      for (const file of files.data) {
        if (file.type === 'file' && file.name.includes(slug) && file.name.endsWith('.md')) {
          fileToDelete = { path: file.path, sha: file.sha! };
          break;
        }
      }
    }

    if (!fileToDelete) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const response = await octokit.rest.repos.deleteFile({
      owner: GITHUB_OWNER!,
      repo: GITHUB_REPO!,
      path: fileToDelete.path,
      message: `Delete article: ${slug}`,
      sha: fileToDelete.sha,
    });

    return NextResponse.json({
      success: true,
      message: `Article ${slug} deleted successfully`,
      commit_sha: response.data.commit.sha,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/commit:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
