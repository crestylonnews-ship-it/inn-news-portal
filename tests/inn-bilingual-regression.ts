import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { alignMarkupBlocks, splitMarkupBlocks } from '../components/BilingualText';
import { normalizeReadableContent, parseArticle } from '../lib/posts';
import { renderMarkdown } from '../lib/markdown';

const ARTICLES = [
  '2026-08-13-article-20260812173022.md',
  '2026-08-11-article-20260811041348.md',
];

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

function testEnglishAbbreviationAndReadabilityNormalization() {
  const original = 'The U.S. policy update preserved the evidence boundary. A second sentence remains available for readers after normalization.';
  const normalized = normalizeReadableContent(original, 'en');
  assert.match(normalized, /U\.S\. policy update/);
  assert.match(normalized, /second sentence remains available/);
  console.log('inn_bilingual_english_abbreviation_normalization=ok');
}

async function main() {
  testMismatchedBlocksRemainVisible();
  testEnglishAbbreviationAndReadabilityNormalization();
  for (const filename of ARTICLES) await testActualArticleParagraphPairs(filename);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
