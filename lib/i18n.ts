export const tagTranslations: Record<string, string> = {
  國際: 'INTERNATIONAL',
  經濟: 'ECONOMY',
  醫療: 'HEALTHCARE',
  健康: 'HEALTH',
  科技: 'TECHNOLOGY',
  AI: 'AI',
  量子科技: 'QUANTUM TECH',
  量子計算: 'QUANTUM COMPUTING',
  教育: 'EDUCATION',
  社會: 'SOCIETY',
  青年: 'YOUTH',
  文化: 'CULTURE',
  公益: 'PUBLIC GOOD',
  環境: 'ENVIRONMENT',
  法律: 'LAW',
  新聞報導: 'NEWS REPORT',
  深度報導: 'DEEP DIVE',
  社論評論: 'EDITORIAL',
  即時快訊: 'BREAKING',
  國際教育議題: 'INTERNATIONAL EDUCATION',
  國內教育議題: 'DOMESTIC EDUCATION',
  青少年議題: 'YOUTH ISSUES',
};

export function tagToEnglish(tag: string): string {
  return tagTranslations[tag] || tag;
}
