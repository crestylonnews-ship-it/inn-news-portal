import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { alignMarkupBlocks, splitMarkupBlocks } from '../components/BilingualText';
import { articlePublishedAtMs, normalizeReadableContent, parseArticle, sortArticlesNewestFirst } from '../lib/posts';
import { renderMarkdown } from '../lib/markdown';

const ARTICLES = [
  '2026-08-13-article-20260812173022.md',
  '2026-08-11-article-20260811041348.md',
];
const LEGACY_ARCHIVE_ARTICLE = '2026-08-11-article-20260811073337.md';

function bodyPairs(zhHtml: string, enHtml: string) {
  return alignMarkupBlocks(zhHtml, enHtml).filter(pair => pair.kind === 'body');
}

async function testActualArticleParagraphPairs(filename: string) {
  const raw = await readFile(join(process.cwd(), 'content', 'articles', filename), 'utf8');
  const article = parseArticle(filename, raw);
  assert.ok(article.content.trim(), `${filename}: 中文內容不可為空`);
  assert.ok(article.contentEn.trim(), `${filename}: 英文內容不可為空`);
  assert.ok(!/^(?:#{1,6}\s*)?(?:來源整理|資料來源|sources?)/im.test(article.content), `${filename}: 中文正文不可重複資料來源段落`);
  assert.ok(!/^(?:#{1,6}\s*)?(?:來源整理|資料來源|sources?)/im.test(article.contentEn), `${filename}: 英文正文不可重複資料來源段落`);
  const pairs = bodyPairs(renderMarkdown(article.content), renderMarkdown(article.contentEn));
  assert.ok(pairs.length >= 1, `${filename}: 須至少有一組正文配對`);
  assert.ok(pairs.every(pair => pair.zh.trim() && pair.en.trim()), `${filename}: 中英正文段落數或區塊類型不一致`);
  console.log(`inn_bilingual_actual_article_pairing=${filename}=ok`);
}

function testMismatchedBlocksRemainVisible() {
  const pairs = bodyPairs('<p>中文第一段</p><p>中文第二段</p>', '<p>English first paragraph.</p>');
  assert.equal(pairs.length, 2);
  assert.match(pairs[0].zh, /中文第一段/);
  assert.match(pairs[0].en, /English first/);
  assert.match(pairs[1].zh, /中文第二段/);
  assert.equal(pairs[1].en, '');
  assert.equal(splitMarkupBlocks(pairs[1].zh).length, 1);
  console.log('inn_bilingual_mismatch_is_not_grouped_or_hidden=ok');
}

function testReaderPreservesPublisherParagraphBoundary() {
  const original = 'The U.S. policy update preserved the evidence boundary. A second sentence remains available for readers after normalization.';
  const normalized = normalizeReadableContent(original, 'en');
  assert.equal(normalized, original);
  assert.equal(normalizeReadableContent('甲段。\n\n乙段。', 'zh'), '甲段。\n\n乙段。');
  console.log('inn_bilingual_reader_preserves_publisher_boundaries=ok');
}

function testHomepageSortsSameDayArticlesByPublishedTimestamp() {
  const older = {
    slug: '2026-08-15-article-20260815120000',
    date: '2026-08-15',
    publishedAt: undefined,
  } as unknown as import('../lib/types').Article;
  const newer = {
    slug: '2026-08-15-article-20260815123541',
    date: '2026-08-15',
    publishedAt: undefined,
  } as unknown as import('../lib/types').Article;
  const explicit = {
    slug: 'legacy-same-day-item',
    date: '2026-08-15',
    publishedAt: '2026-08-15T12:40:00+00:00',
  } as unknown as import('../lib/types').Article;
  assert.ok(articlePublishedAtMs(newer) > articlePublishedAtMs(older));
  assert.deepEqual(sortArticlesNewestFirst([older, explicit, newer]).map(article => article.slug), [explicit.slug, newer.slug, older.slug]);
  console.log('inn_homepage_same_day_articles_sort_by_publish_time=ok');
}

async function testLegacyArchiveContentIsExtractedIntoSeparateLanguageLayers() {
  const raw = await readFile(join(process.cwd(), 'content', 'articles', LEGACY_ARCHIVE_ARTICLE), 'utf8');
  const article = parseArticle(LEGACY_ARCHIVE_ARTICLE, raw);
  assert.match(article.content, /巴基斯坦政府最近批準了一項國家住房政策/);
  assert.doesNotMatch(article.content, /Global Archive\s*\/\s*英文存檔|Stellar Archive|Global federation observation/i);
  assert.match(article.contentEn, /The Pakistani government has recently approved a national housing policy/);
  assert.doesNotMatch(article.contentEn, /繁體中文深度報導|巴基斯坦政府最近批準了一項國家住房政策/);
  assert.doesNotMatch(article.contentEn, /<details>|<summary>|<div|^\*\*Pakistan approves/m);
  console.log('inn_legacy_archive_layers_are_separated=ok');
}

async function main() {
  testMismatchedBlocksRemainVisible();
  testReaderPreservesPublisherParagraphBoundary();
  testHomepageSortsSameDayArticlesByPublishedTimestamp();
  await testLegacyArchiveContentIsExtractedIntoSeparateLanguageLayers();
  for (const filename of ARTICLES) await testActualArticleParagraphPairs(filename);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
