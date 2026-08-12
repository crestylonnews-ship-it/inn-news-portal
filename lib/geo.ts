import { Article } from './types';

export interface ArticleGeoPoint {
  key: string;
  label: string;
  labelEn: string;
  region: string;
  lon: number;
  lat: number;
}

const GEO_RULES: Array<{ keywords: string[]; point: Omit<ArticleGeoPoint, 'key'> }> = [
  { keywords: ['台灣', '臺灣', 'taiwan', '台達電', '中美晶', '北台灣'], point: { label: '台灣', labelEn: 'Taiwan', region: '東亞', lon: 121, lat: 23.7 } },
  { keywords: ['香港', 'hong kong', '粵港澳', '廣東', 'guangdong', '澳門', 'macau'], point: { label: '粵港澳', labelEn: 'Greater Bay Area', region: '東亞', lon: 113.7, lat: 22.8 } },
  { keywords: ['日本', 'japan', '東京', 'nhk'], point: { label: '日本', labelEn: 'Japan', region: '東亞', lon: 138.3, lat: 36.2 } },
  { keywords: ['韓國', '南韓', 'south korea', 'korea'], point: { label: '韓國', labelEn: 'South Korea', region: '東亞', lon: 127.8, lat: 36.3 } },
  { keywords: ['北韓', 'north korea'], point: { label: '北韓', labelEn: 'North Korea', region: '東北亞', lon: 127, lat: 40.3 } },
  { keywords: ['俄羅斯', '俄國', 'russia', 'moscow'], point: { label: '俄羅斯', labelEn: 'Russia', region: '歐亞', lon: 90, lat: 55 } },
  { keywords: ['烏克蘭', 'ukraine'], point: { label: '烏克蘭', labelEn: 'Ukraine', region: '歐洲', lon: 31.2, lat: 49 } },
  { keywords: ['泰國', 'thailand', '曼谷', 'bangkok'], point: { label: '泰國', labelEn: 'Thailand', region: '東南亞', lon: 100.5, lat: 15.8 } },
  { keywords: ['緬甸', 'myanmar'], point: { label: '緬甸', labelEn: 'Myanmar', region: '東南亞', lon: 96.2, lat: 21.2 } },
  { keywords: ['印尼', '印度尼西亞', 'indonesia'], point: { label: '印尼', labelEn: 'Indonesia', region: '東南亞', lon: 117, lat: -2 } },
  { keywords: ['東南亞', 'southeast asia', 'asean', '東盟'], point: { label: '東南亞', labelEn: 'Southeast Asia', region: '東南亞', lon: 106, lat: 8 } },
  { keywords: ['南海', 'south china sea'], point: { label: '南海', labelEn: 'South China Sea', region: '東南亞', lon: 114, lat: 12 } },
  { keywords: ['亞太', 'asia-pacific', 'asia pacific', '亞太區域'], point: { label: '亞太', labelEn: 'Asia-Pacific', region: '亞太', lon: 132, lat: 20 } },
  { keywords: ['中國', 'china', '北京', '上海', '美中', 'us-china'], point: { label: '中國', labelEn: 'China', region: '東亞', lon: 104, lat: 35 } },
  { keywords: ['美國', '美洲', 'united states', 'america', 'washington'], point: { label: '美國', labelEn: 'United States', region: '北美', lon: -100, lat: 38 } },
  { keywords: ['歐洲', 'europe', '英國', '英國', 'germany', 'france'], point: { label: '歐洲', labelEn: 'Europe', region: '歐洲', lon: 15, lat: 51 } },
  { keywords: ['中東', 'middle east'], point: { label: '中東', labelEn: 'Middle East', region: '中東', lon: 44, lat: 29 } },
  { keywords: ['非洲', 'africa'], point: { label: '非洲', labelEn: 'Africa', region: '非洲', lon: 20, lat: 2 } },
  { keywords: ['澳洲', '澳大利亞', 'australia'], point: { label: '澳洲', labelEn: 'Australia', region: '大洋洲', lon: 134, lat: -25 } },
];

const GLOBAL_POINT: Omit<ArticleGeoPoint, 'key'> = {
  label: '全球資料',
  labelEn: 'Global Signal',
  region: '全球',
  lon: 0,
  lat: 0,
};

export function getArticleGeoPoint(article: Article): ArticleGeoPoint {
  const searchable = [article.title, article.titleEn, article.excerpt || '', article.excerptEn || '', article.content, article.contentEn, article.category, ...(article.tags || [])].join(' ').toLowerCase();
  const match = GEO_RULES.find(rule => rule.keywords.some(keyword => searchable.includes(keyword.toLowerCase())));
  const point = match?.point || GLOBAL_POINT;
  return { ...point, key: `${point.labelEn}:${point.lon}:${point.lat}` };
}

export function getArticleGeoEntries(articles: Article[]) {
  return articles.map(article => ({ article, geo: getArticleGeoPoint(article) }));
}
