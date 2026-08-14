'use client';

import Link from 'next/link';
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Article } from '@/lib/types';
import { getArticleGeoEntries } from '@/lib/geo';
import BilingualText, { useLanguage } from './BilingualText';
import worldCountries from '@/lib/world-countries.json';

type Bounds = { west: number; east: number; south: number; north: number };
type Viewport = { centerLon: number; centerLat: number; zoom: number };
type GeoFeature = { type: string; geometry?: { type: string; coordinates: unknown }; properties?: { NAME?: string } };
type GeoCollection = { type: string; features: GeoFeature[] };
type GeoEntry = ReturnType<typeof getArticleGeoEntries>[number];
type CategoryMeta = {
  key: string;
  label: string;
  labelEn: string;
  short: string;
  shortEn: string;
  color: string;
  keywords: string[];
};

type Props = { articles: Article[]; compact?: boolean; home?: boolean };

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 540;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4.4;
const RECENT_DAYS = 7;
const REGIONS = [
  { label: '東亞', labelEn: 'EAST ASIA', lon: 122, lat: 30, zoom: 2.7 },
  { label: '東北亞', labelEn: 'NORTHEAST ASIA', lon: 130, lat: 42, zoom: 2.8 },
  { label: '東南亞', labelEn: 'SOUTHEAST ASIA', lon: 106, lat: 7, zoom: 3.1 },
  { label: '南亞', labelEn: 'SOUTH ASIA', lon: 78, lat: 22, zoom: 2.6 },
  { label: '中亞', labelEn: 'CENTRAL ASIA', lon: 67, lat: 42, zoom: 2.6 },
  { label: '中東', labelEn: 'MIDDLE EAST', lon: 44, lat: 29, zoom: 2.7 },
  { label: '亞太', labelEn: 'ASIA-PACIFIC', lon: 132, lat: 20, zoom: 2.0 },
  { label: '歐洲', labelEn: 'EUROPE', lon: 15, lat: 50, zoom: 2.8 },
  { label: '歐亞', labelEn: 'EURASIA', lon: 72, lat: 52, zoom: 2.0 },
  { label: '非洲', labelEn: 'AFRICA', lon: 20, lat: 4, zoom: 1.9 },
  { label: '北美', labelEn: 'NORTH AMERICA', lon: -100, lat: 38, zoom: 2.1 },
  { label: '中美洲', labelEn: 'CENTRAL AMERICA', lon: -86, lat: 15, zoom: 2.4 },
  { label: '南美', labelEn: 'SOUTH AMERICA', lon: -60, lat: -17, zoom: 2.2 },
  { label: '大洋洲', labelEn: 'OCEANIA', lon: 145, lat: -24, zoom: 2.0 },
];

const CATEGORY_META: CategoryMeta[] = [
  { key: 'politics', label: '政治與國際', labelEn: 'POLITICS & WORLD', short: '政', shortEn: 'POL', color: '#fb7185', keywords: ['政治', '國際', '政府', '外交', '司法', '選舉', '安全', '戰爭', '地緣', 'politic', 'government', 'election', 'security', 'war', 'world', 'international'] },
  { key: 'technology', label: '科技與數位', labelEn: 'TECH & DIGITAL', short: '科', shortEn: 'TEC', color: '#38bdf8', keywords: ['科技', '資訊', '資安', '人工智慧', '軟體', '數位', 'technology', 'software', 'cyber', 'digital', 'artificial intelligence', 'ai'] },
  { key: 'business', label: '經濟與商業', labelEn: 'BUSINESS & ECONOMY', short: '經', shortEn: 'ECO', color: '#f59e0b', keywords: ['金融', '銀行', '保險', '能源', '物流', '零售', '電商', '經濟', '商業', '財經', '產業', '市場', 'business', 'economy', 'finance', 'energy', 'retail', 'market'] },
  { key: 'society', label: '社會與生活', labelEn: 'SOCIETY & LIFE', short: '社', shortEn: 'SOC', color: '#a78bfa', keywords: ['社會', '教育', '青少年', '勞動', '薪資', '住宅', '居住', '民生', '弱勢', '長照', '街友', '貧富', 'social', 'education', 'labor', 'housing', 'community'] },
  { key: 'health', label: '醫療與健康', labelEn: 'HEALTH & MEDICINE', short: '醫', shortEn: 'HLT', color: '#34d399', keywords: ['醫療', '健康', '生技', 'medical', 'health', 'biotech'] },
  { key: 'environment', label: '環境與氣候', labelEn: 'CLIMATE & ENVIRONMENT', short: '環', shortEn: 'ENV', color: '#2dd4bf', keywords: ['環境', '氣候', '永續', '公害', '交通', 'environment', 'climate', 'sustainability', 'pollution'] },
  { key: 'culture', label: '文化與媒體', labelEn: 'CULTURE & MEDIA', short: '文', shortEn: 'CUL', color: '#f472b6', keywords: ['媒體', '新聞', '出版', '文化', '體育', '運動', 'media', 'culture', 'sports', 'publishing'] },
  { key: 'other', label: '其他', labelEn: 'OTHER SIGNALS', short: '他', shortEn: 'OTH', color: '#94a3b8', keywords: [] },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBounds(viewport: Viewport): Bounds {
  const width = 180 / viewport.zoom;
  const height = 90 / viewport.zoom;
  return {
    west: Math.max(-180, viewport.centerLon - width),
    east: Math.min(180, viewport.centerLon + width),
    south: Math.max(-90, viewport.centerLat - height),
    north: Math.min(90, viewport.centerLat + height),
  };
}

function isLongitudeVisible(lon: number, bounds: Bounds) {
  return lon >= bounds.west && lon <= bounds.east;
}

function isVisible(lon: number, lat: number, bounds: Bounds, region: string) {
  if (region === '全球') return true;
  return lat >= bounds.south && lat <= bounds.north && isLongitudeVisible(lon, bounds);
}

function project(lon: number, lat: number, viewport: Viewport) {
  const spanLon = 360 / viewport.zoom;
  const spanLat = 180 / viewport.zoom;
  const west = viewport.centerLon - spanLon / 2;
  const north = viewport.centerLat + spanLat / 2;
  return {
    x: ((lon - west) / spanLon) * MAP_WIDTH,
    y: ((north - lat) / spanLat) * MAP_HEIGHT,
  };
}

function projectRing(ring: unknown[], viewport: Viewport) {
  return ring
    .map((point) => {
      if (!Array.isArray(point)) return '';
      const [lon, lat] = point as [number, number];
      const projected = project(lon, lat, viewport);
      return `${projected.x.toFixed(1)},${projected.y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(' ');
}

function featureToPaths(feature: GeoFeature, viewport: Viewport) {
  const geometry = feature.geometry;
  if (!geometry) return [];
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as unknown[]).map((ring) => projectRing(ring as unknown[], viewport));
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as unknown[]).flatMap((polygon) =>
      (polygon as unknown[]).map((ring) => projectRing(ring as unknown[], viewport)),
    );
  }
  return [];
}

function getCategoryMeta(category: string) {
  const normalized = category.toLowerCase();
  return CATEGORY_META.find((meta) => meta.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) || CATEGORY_META[CATEGORY_META.length - 1];
}

function displayGeoLabel(geo: GeoEntry['geo'], language: string) {
  return language === 'en' ? geo.labelEn : geo.label;
}

function displayRegionLabel(region: string, language: string) {
  if (region === '全球') return language === 'en' ? 'GLOBAL' : '全球';
  const configuredRegion = REGIONS.find((item) => item.label === region);
  return language === 'en' && configuredRegion ? configuredRegion.labelEn : region;
}

function displayCategoryLabel(category: CategoryMeta, language: string) {
  return language === 'en' ? category.labelEn : category.label;
}

function isWithinLastSevenDays(article: Article) {
  const sourceDate = article.publishedAt || article.date;
  const timestamp = Date.parse(sourceDate);
  if (!Number.isFinite(timestamp)) return false;

  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (RECENT_DAYS - 1));
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}

function formatTerminalTime(value: Date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(value).replace(' ', ' // ');
}

export default function NewsMapExplorer({ articles, compact = false, home = false }: Props) {
  const [viewport, setViewport] = useState<Viewport>({ centerLon: 20, centerLat: 18, zoom: 1.05 });
  const [geoJson] = useState<GeoCollection>(() => worldCountries as GeoCollection);
  const [dragging, setDragging] = useState(false);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isDetailTopicMenuOpen, setIsDetailTopicMenuOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState('全球');
  const [terminalTime, setTerminalTime] = useState('');
  const { language, setLanguage } = useLanguage();
  const dragStart = useRef<{ x: number; y: number; viewport: Viewport } | null>(null);
  const mapSvgRef = useRef<SVGSVGElement | null>(null);
  const regionDetailsRef = useRef<HTMLElement | null>(null);
  const entries = useMemo(() => getArticleGeoEntries(articles), [articles]);
  const allRecentEntries = useMemo(() => entries.filter(({ article }) => isWithinLastSevenDays(article)), [entries]);
  const recentEntries = useMemo(
    () => allRecentEntries.filter(({ article }) => selectedTopics.length === 0 || selectedTopics.includes(getCategoryMeta(article.category).key)),
    [allRecentEntries, selectedTopics],
  );
  const isShowingAllTopics = selectedTopics.length === 0;
  const bounds = useMemo(() => getBounds(viewport), [viewport]);
  const todayRegionBriefs = useMemo(() => {
    const dateKey = new Date().toISOString().slice(0, 10);
    const todayEntries = entries.filter(({ article }) => {
      const sourceDate = article.publishedAt || article.date;
      return article.date === dateKey || sourceDate.startsWith(dateKey);
    });
    const sourceEntries = todayEntries.length > 0 ? todayEntries : entries.filter(({ article }) => article.date === articles[0]?.date);
    const groups = new Map<string, GeoEntry[]>();
    sourceEntries.forEach((entry) => {
      const group = groups.get(entry.geo.region) || [];
      groups.set(entry.geo.region, [...group, entry]);
    });

    return Array.from(groups.entries())
      .map(([region, regionEntries]) => {
        const ordered = [...regionEntries].sort((a, b) => new Date(b.article.date).getTime() - new Date(a.article.date).getTime());
        const anchor = ordered[0]?.geo;
        const categoryCounts = new Map<string, { category: CategoryMeta; count: number }>();
        ordered.forEach(({ article }) => {
          const category = getCategoryMeta(article.category);
          const current = categoryCounts.get(category.key);
          categoryCounts.set(category.key, current ? { ...current, count: current.count + 1 } : { category, count: 1 });
        });
        return {
          region,
          anchor,
          entries: ordered,
          categories: Array.from(categoryCounts.values()).sort((a, b) => b.count - a.count).slice(0, 2),
        };
      })
      .filter((brief) => Boolean(brief.anchor))
      .sort((a, b) => b.entries.length - a.entries.length)
      .slice(0, 6);
  }, [articles, entries]);

  useEffect(() => {
    if (!home) return;

    const refreshTerminalTime = () => setTerminalTime(formatTerminalTime(new Date()));
    refreshTerminalTime();
    const timer = window.setInterval(refreshTerminalTime, 1000);
    return () => window.clearInterval(timer);
  }, [home]);

  useEffect(() => {
    const svg = mapSvgRef.current;
    if (!svg) return;

    const redraw = () => setViewport((current) => ({ ...current }));
    const frame = window.requestAnimationFrame(redraw);
    const observer = new ResizeObserver(() => window.requestAnimationFrame(redraw));
    observer.observe(svg);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [geoJson]);

  useEffect(() => {
    const svg = mapSvgRef.current;
    if (!svg) return;

    const zoomWithWheel = (event: WheelEvent) => {
      event.preventDefault();
      setViewport((current) => ({
        ...current,
        zoom: clamp(Number((current.zoom + (event.deltaY > 0 ? -0.45 : 0.45)).toFixed(2)), MIN_ZOOM, MAX_ZOOM),
      }));
    };

    svg.addEventListener('wheel', zoomWithWheel, { passive: false });
    return () => svg.removeEventListener('wheel', zoomWithWheel);
  }, []);

  useEffect(() => {
    if (selectedRegionKey && !recentEntries.some(({ geo }) => geo.key === selectedRegionKey)) {
      setSelectedRegionKey(null);
    }
  }, [recentEntries, selectedRegionKey]);

  const visibleEntries = useMemo(
    () => recentEntries
      .filter(({ geo }) => isVisible(geo.lon, geo.lat, bounds, geo.region))
      .sort((a, b) => new Date(b.article.date).getTime() - new Date(a.article.date).getTime()),
    [bounds, recentEntries],
  );

  const regionSummaries = useMemo(() => {
    const groups = new Map<string, { geo: GeoEntry['geo']; entries: GeoEntry[] }>();
    visibleEntries.forEach((entry) => {
      const current = groups.get(entry.geo.key);
      groups.set(entry.geo.key, current ? { ...current, entries: [...current.entries, entry] } : { geo: entry.geo, entries: [entry] });
    });
    return Array.from(groups.values())
      .map((group) => ({ ...group, count: group.entries.length }))
      .sort((a, b) => b.count - a.count);
  }, [visibleEntries]);

  const groupedPoints = useMemo(() => {
    return regionSummaries.flatMap((region) => {
      const categoryGroups = new Map<string, { category: CategoryMeta; entries: GeoEntry[] }>();
      region.entries.forEach((entry) => {
        const category = getCategoryMeta(entry.article.category);
        const current = categoryGroups.get(category.key);
        categoryGroups.set(category.key, current ? { ...current, entries: [...current.entries, entry] } : { category, entries: [entry] });
      });
      const categories = Array.from(categoryGroups.values()).sort((a, b) => b.entries.length - a.entries.length);
      const spread = categories.length > 1 ? Math.min(18, 8 + region.count * 0.35) : 0;

      return categories.map((group, index) => {
        const angle = categories.length > 1 ? (-Math.PI / 2) + (index * (Math.PI * 2)) / categories.length : 0;
        return {
          key: `${region.geo.key}:${group.category.key}`,
          geo: region.geo,
          category: group.category,
          entries: group.entries,
          count: group.entries.length,
          totalCount: region.count,
          offsetX: Math.cos(angle) * spread,
          offsetY: Math.sin(angle) * spread,
        };
      });
    });
  }, [regionSummaries]);

  const categoryLegend = useMemo(() => {
    const counts = new Map<string, number>();
    allRecentEntries.forEach(({ article }) => {
      const category = getCategoryMeta(article.category);
      counts.set(category.key, (counts.get(category.key) || 0) + 1);
    });
    return CATEGORY_META
      .filter((category) => counts.has(category.key))
      .map((category) => ({ ...category, count: counts.get(category.key) || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [allRecentEntries]);

  const selectedRegionEntries = useMemo(
    () => selectedRegionKey ? recentEntries.filter(({ geo }) => geo.key === selectedRegionKey).sort((a, b) => new Date(b.article.date).getTime() - new Date(a.article.date).getTime()) : [],
    [recentEntries, selectedRegionKey],
  );
  const selectedRegionGeo = selectedRegionEntries[0]?.geo;
  const selectedCategorySummary = useMemo(() => {
    const counts = new Map<string, { category: CategoryMeta; count: number }>();
    selectedRegionEntries.forEach(({ article }) => {
      const category = getCategoryMeta(article.category);
      const current = counts.get(category.key);
      counts.set(category.key, current ? { ...current, count: current.count + 1 } : { category, count: 1 });
    });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [selectedRegionEntries]);

  const mapPaths = useMemo(() => {
    if (!geoJson) return [];
    return geoJson.features.flatMap((feature, featureIndex) =>
      featureToPaths(feature, viewport).map((path, pathIndex) => ({
        key: `${featureIndex}-${pathIndex}`,
        path,
        name: feature.properties?.NAME || 'Unknown',
      })),
    );
  }, [geoJson, viewport]);

  const updateZoom = (direction: 1 | -1) => {
    setViewport((current) => ({ ...current, zoom: clamp(Number((current.zoom + direction * 0.45).toFixed(2)), MIN_ZOOM, MAX_ZOOM) }));
  };

  const resetViewport = () => {
    setSelectedRegionKey(null);
    setActiveRegion('全球');
    setViewport({ centerLon: 20, centerLat: 18, zoom: 1.05 });
  };

  const focusRegion = (label: string, lon: number, lat: number, zoom: number) => {
    setActiveRegion(label);
    const spanLon = 360 / zoom;
    const spanLat = 180 / zoom;
    setViewport({
      centerLon: clamp(lon, -180 + spanLon / 2, 180 - spanLon / 2),
      centerLat: clamp(lat, -90 + spanLat / 2, 90 - spanLat / 2),
      zoom,
    });
  };

  const toggleTopic = (topicKey: string) => {
    setSelectedTopics((current) => current.includes(topicKey) ? current.filter((key) => key !== topicKey) : [...current, topicKey]);
  };

  const clearTopicSelection = () => setSelectedTopics([]);

  const focusTodayBrief = (brief: typeof todayRegionBriefs[number]) => {
    if (!brief.anchor) return;
    if (brief.region === '全球') {
      resetViewport();
      return;
    }
    const quickRegion = REGIONS.find((region) => region.label === brief.region);
    focusRegion(
      brief.region,
      quickRegion?.lon ?? brief.anchor.lon,
      quickRegion?.lat ?? brief.anchor.lat,
      quickRegion?.zoom ?? 2.35,
    );
  };

  const handleRegionPointClick = (regionKey: string) => {
    setIsDetailTopicMenuOpen(false);
    setSelectedRegionKey(regionKey);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => regionDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    });
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, viewport };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const start = dragStart.current;
    if (!start) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const spanLon = 360 / start.viewport.zoom;
    const spanLat = 180 / start.viewport.zoom;
    const deltaLon = ((event.clientX - start.x) / rect.width) * spanLon;
    const deltaLat = ((event.clientY - start.y) / rect.height) * spanLat;
    setViewport({
      ...start.viewport,
      centerLon: clamp(start.viewport.centerLon - deltaLon, -180 + spanLon / 2, 180 - spanLon / 2),
      centerLat: clamp(start.viewport.centerLat + deltaLat, -90 + spanLat / 2, 90 - spanLat / 2),
    });
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
    setDragging(false);
  };

  return (
    <section id="map-explorer" className={`map-explorer space-y-6 ${compact ? 'map-home-preview' : ''} ${home ? 'map-home-explorer' : ''}`} aria-labelledby={home ? undefined : 'map-explorer-title'} aria-label={home ? '地圖新聞探索 / Map news exploration' : undefined}>
      {home && (
        <>
          <section className="map-home-terminal" aria-labelledby="map-home-terminal-title">
            <div className="map-home-terminal-identity">
              <span className="map-home-terminal-eyebrow"><BilingualText zh="即時新聞終端 // 地圖索引" en="LIVE NEWS TERMINAL // MAP INDEX" /></span>
              <h2 id="map-home-terminal-title"><BilingualText zh="INN 星際聯邦新聞網" en="INN STELLAR FEDERATION NEWS" /></h2>
              <p><BilingualText zh="空間及索引，把選擇權還給你" en="SPACE, INDEX, AND THE CHOICE IS YOURS" /></p>
            </div>

            <div className="map-home-terminal-clock" aria-live="polite">
              <span><i aria-hidden="true" /> <BilingualText zh="即時星際標準時間" en="LIVE STELLAR STANDARD TIME" /></span>
              <time dateTime={terminalTime || undefined}>{terminalTime || 'SYNCING // --:--:--'}</time>
              <small>UTC+08 // SIGNAL ONLINE</small>
            </div>

            <ol className="map-home-terminal-guide" aria-label="地圖使用方式">
              <li><b>01</b><BilingualText zh="節點：開啟區域新聞" en="NODE: OPEN REGIONAL NEWS" /></li>
              <li><b>02</b><BilingualText zh="領域：複選篩選訊號" en="TOPICS: FILTER SIGNALS" /></li>
              <li><b>03</b><BilingualText zh="FOCUS：快速鎖定區域" en="FOCUS: JUMP TO A REGION" /></li>
            </ol>

            <div className="home-social-links" aria-label="INN 官方社群連結">
              <span><BilingualText zh="追蹤 INN" en="FOLLOW INN" /></span>
              <a href="https://www.instagram.com/inn.crestylon/" target="_blank" rel="noopener noreferrer">Instagram <i aria-hidden="true">↗</i></a>
              <a href="https://www.threads.com/@inn.crestylon?hl=zh-tw" target="_blank" rel="noopener noreferrer">Threads <i aria-hidden="true">↗</i></a>
            </div>
          </section>

          <section className="map-headline-ticker" aria-label="近期新聞標題跑馬燈 / Recent headline ticker">
            <span className="map-headline-ticker-label">{language === 'zh' ? '最新新聞' : 'LATEST NEWS'}</span>
            <div className="map-headline-ticker-window">
              <div className="map-headline-ticker-track">
                {[0, 1].map((copy) => (
                  <div className="map-headline-ticker-group" aria-hidden={copy === 1} key={`ticker-copy-${copy}`}>
                    {recentEntries.slice(0, 14).map(({ article, geo }) => {
                      const category = getCategoryMeta(article.category);
                      const headline = language === 'en' ? article.titleEn || article.title : article.title;
                      return (
                        <Link key={`${copy}-${article.slug}`} href={`/articles/${article.slug}`} className="map-headline-ticker-item">
                          <i aria-hidden="true" style={{ backgroundColor: category.color }} />
                          <span className="map-headline-ticker-region">{displayGeoLabel(geo, language)}</span>
                          <span>{headline}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {!home && (
        <>
          <div className="flex flex-col gap-4 border-b border-cyan-400/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="map-eyebrow"><BilingualText zh={compact ? '地圖測試空間 // 近七日地理新聞' : '地圖實驗空間 // 近七日地理新聞索引'} en={compact ? 'MAP TEST SPACE // LAST 7 DAYS' : 'MAP LAB // LAST 7 DAYS INDEX'} /></p>
              <h2 id="map-explorer-title" className="font-orbitron text-2xl font-black tracking-tight text-white sm:text-3xl"><BilingualText zh="你決定看什麼，地圖只呈現訊號" en="YOU CHOOSE THE SIGNAL. THE MAP SHOWS THE FIELD." /></h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400"><BilingualText zh="地圖只顯示最近 7 天的新聞；拖曳、縮放或選擇區域，依自己的方向探索。地區新聞越多，節點越大；不同分類使用不同顏色。點擊節點後，頁面會滑到下方顯示該區域的相關新聞。" en="Only the last 7 days are shown. Pan, zoom or choose a region to explore on your own terms. More reports create larger nodes, categories use distinct colors, and a node click reveals the regional stories below." block /></p>
            </div>
            <div className="map-readout" aria-live="polite">
              <span><BilingualText zh="近 7 日資料" en="LAST 7 DAYS" /></span>
              <strong>{recentEntries.length}</strong>
              <small><BilingualText zh="篇報導" en="REPORTS" /></small>
            </div>
          </div>

          <div className="map-index-controls" aria-label="新聞索引控制">
            <div className="map-index-control-group">
              <span className="map-index-control-label"><BilingualText zh="閱讀語言" en="READING LANGUAGE" /></span>
              <button type="button" className={`map-index-button ${language === 'zh' ? 'is-active' : ''}`} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>中文</button>
              <button type="button" className={`map-index-button ${language === 'en' ? 'is-active' : ''}`} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
            </div>
            <div className="map-index-control-group">
              <span className="map-index-control-label"><BilingualText zh="時事範圍" en="CURRENT AFFAIRS" /></span>
              <span className="map-index-status"><BilingualText zh="近 7 日" en="LAST 7 DAYS" /></span>
              <Link href="/timeline" className="map-index-timeline"><BilingualText zh="所有時間線 →" en="FULL TIMELINE →" /></Link>
            </div>
          </div>
        </>
      )}

      <div className="map-category-legend" aria-label="新聞主題多選圖例">
        <span className="map-category-legend-label"><BilingualText zh="點選領域 · 可複選" en="CLICK TOPICS · MULTI-SELECT" /></span>
        <button type="button" className={`map-category-chip map-category-chip-button ${isShowingAllTopics ? 'is-active' : ''}`} onClick={clearTopicSelection} aria-pressed={isShowingAllTopics}>
          <i aria-hidden="true" className="map-category-all-dot" />
          <BilingualText zh="全部訊號" en="ALL SIGNALS" />
          <b>{allRecentEntries.length}</b>
        </button>
        {categoryLegend.map((category) => {
          const isSelected = selectedTopics.includes(category.key);
          return (
            <button
              key={category.key}
              type="button"
              className={`map-category-chip map-category-chip-button ${isSelected ? 'is-selected' : ''}`}
              onClick={() => toggleTopic(category.key)}
              aria-pressed={isSelected}
              style={isSelected ? { borderColor: category.color, color: category.color } : undefined}
            >
              <i aria-hidden="true" style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}` }} />
              {isSelected && <span aria-hidden="true" className="map-topic-check">✓</span>}
              <BilingualText zh={category.label} en={category.labelEn} />
              <b>{category.count}</b>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="map-console">
          <div className="map-console-bar">
            <div className="flex items-center gap-2">
              <span className="map-live-dot" aria-hidden="true" />
              <span><BilingualText zh="近七日地理訊號在線" en="LAST 7 DAYS GEO SIGNAL ONLINE" /></span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">{bounds.west.toFixed(0)}°W — {bounds.east.toFixed(0)}°E</span>
          </div>

          <div className="map-stage">
            <svg
              ref={mapSvgRef}
              className={`world-map ${dragging ? 'is-dragging' : ''}`}
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="application"
              aria-label="可拖曳縮放的世界地圖 / Draggable and zoomable world map"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <defs>
                <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(103,232,249,0.11)" strokeWidth="1" />
                </pattern>
                <radialGradient id="map-glow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#102b3b" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#070c16" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-glow)" />
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-grid)" />
              <g className="world-land" aria-hidden="true">
                {mapPaths.map(({ key, path, name }) => <path key={key} d={`M ${path}`} vectorEffect="non-scaling-stroke" aria-label={name} />)}
              </g>
              {mapPaths.length === 0 && (
                <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle" className="map-loading-label">
                  {language === 'en' ? 'LOADING MAP DATA' : '載入地圖資料中'}
                </text>
              )}
              <g className="map-latitude-lines" aria-hidden="true">
                {[-60, -30, 0, 30, 60].map((lat) => { const p = project(0, lat, viewport); return <line key={lat} x1="0" x2={MAP_WIDTH} y1={p.y} y2={p.y} />; })}
              </g>
              <g className="map-points" aria-label={language === 'en' ? 'GEOGRAPHIC NEWS NODES FROM THE LAST 7 DAYS' : '近七日新聞地理節點'}>
                {groupedPoints.map(({ geo, category, count, totalCount, offsetX, offsetY }) => {
                  const isGlobalData = geo.region === '全球';
                  const point = isGlobalData ? { x: 78, y: MAP_HEIGHT - 70 } : project(geo.lon, geo.lat, viewport);
                  const zoomScale = clamp(Math.pow(viewport.zoom, 0.45), 1, 1.9);
                  const baseRadius = Math.min(26, 6.5 + Math.sqrt(count) * 2.8 + Math.log2(totalCount + 1) * 1.2);
                  const radius = clamp(baseRadius * zoomScale, 6, 42);
                  const isSelected = selectedRegionKey === geo.key;
                  return (
                    <g
                      key={`${geo.key}:${category.key}:${language}`}
                      transform={`translate(${point.x + offsetX * zoomScale} ${point.y + offsetY * zoomScale})`}
                      className={`map-point ${isSelected ? 'is-selected' : ''}`}
                      style={{ color: category.color }}
                      data-selected={isSelected}
                      role="button"
                      tabIndex={0}
                      aria-label={`${displayGeoLabel(geo, language)} ${displayCategoryLabel(category, language)} ${count} ${language === 'en' ? 'recent reports' : '篇近七日新聞'}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => { event.stopPropagation(); handleRegionPointClick(geo.key); }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleRegionPointClick(geo.key);
                        }
                      }}
                    >
                      <circle r={radius} className="map-point-core" />
                      <text key={`label-${language}`} y={-radius - 5} textAnchor="middle" className="map-point-label">{displayGeoLabel(geo, language)} · {language === 'en' ? category.shortEn : category.short}</text>
                      <text y={radius + 14} textAnchor="middle" className="map-point-count">{count}</text>
                    </g>
                  );
                })}
              </g>
              <g className="map-crosshair" aria-hidden="true">
                <path d={`M ${MAP_WIDTH / 2 - 12} ${MAP_HEIGHT / 2} H ${MAP_WIDTH / 2 + 12} M ${MAP_WIDTH / 2} ${MAP_HEIGHT / 2 - 12} V ${MAP_HEIGHT / 2 + 12}`} />
              </g>
            </svg>
            {!home && <div className="map-overlay-label map-overlay-label-top"><BilingualText zh="拖曳平移 · 滾輪縮放 · 點擊節點看區域新聞" en="DRAG · ZOOM · CLICK A NODE FOR REGIONAL NEWS" /></div>}
            <div className="map-global-anchor" aria-label={language === 'en' ? 'GLOBAL DATA FIXED POSITION' : '全球資料固定位置'}>
              <span>{language === 'en' ? 'GLOBAL DATA' : '全球資料'}</span>
              <small>{language === 'en' ? 'CROSS-REGION' : '跨區訊號'}</small>
            </div>
            <div className="map-overlay-label map-overlay-label-bottom">LAT {viewport.centerLat.toFixed(1)}° / LON {viewport.centerLon.toFixed(1)}° / Z{viewport.zoom.toFixed(1)}</div>
            <div className="map-controls" aria-label={language === 'en' ? 'MAP CONTROLS' : '地圖控制'}>
              <button type="button" onClick={() => updateZoom(1)} aria-label={language === 'en' ? 'ZOOM IN' : '放大地圖'}>+</button>
              <button type="button" onClick={() => updateZoom(-1)} aria-label={language === 'en' ? 'ZOOM OUT' : '縮小地圖'}>−</button>
              <button type="button" onClick={resetViewport} aria-label={language === 'en' ? 'RESET MAP VIEW' : '重設地圖視窗'}>⌂</button>
            </div>
          </div>

          <div className="map-region-bar" aria-label="快速定位區域">
            <span className="map-region-label"><BilingualText zh="快速鎖定" en="FOCUS" /></span>
            <button type="button" onClick={resetViewport} className={`map-region-chip ${activeRegion === '全球' ? 'is-active' : ''}`} aria-pressed={activeRegion === '全球'}>
              <BilingualText zh="全球" en="GLOBAL" />
            </button>
            {REGIONS.map((region) => (
              <button key={region.label} type="button" onClick={() => focusRegion(region.label, region.lon, region.lat, region.zoom)} className={`map-region-chip ${activeRegion === region.label ? 'is-active' : ''}`} aria-pressed={activeRegion === region.label}>
                <BilingualText zh={region.label} en={region.labelEn} />
              </button>
            ))}
          </div>
          {compact && (
            <div className="map-home-link">
              <Link href="/" className="map-home-link-button">
                <BilingualText zh="開啟完整空間索引 →" en="OPEN FULL SPACE INDEX →" />
              </Link>
            </div>
          )}
        </div>

        <aside className="map-results" aria-labelledby="map-results-title">
          <div className="map-results-header">
            <div>
              <p className="map-eyebrow"><BilingualText zh="範圍結果 // 近七日" en="BOUNDS // LAST 7 DAYS" /></p>
              <h3 id="map-results-title" className="font-orbitron text-lg font-bold text-cyan-100"><BilingualText zh="畫面中的新聞" en="REPORTS IN VIEW" /></h3>
            </div>
            <span className="map-result-count">{visibleEntries.length}</span>
          </div>
          <div className="map-region-summary">
            {regionSummaries.slice(0, 5).map(({ geo, count }) => <span key={geo.key}>{displayGeoLabel(geo, language)} <b>{count}</b></span>)}
            {regionSummaries.length === 0 && <span><BilingualText zh="此視窗目前沒有近七日定位訊號" en="NO RECENT GEO SIGNAL IN THIS VIEW" /></span>}
          </div>
          <div className="map-result-list">
            {visibleEntries.slice(0, compact ? 4 : 6).map(({ article, geo }) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="map-result-item">
                <span className="map-result-meta">{displayGeoLabel(geo, language)} · {article.date} · {displayCategoryLabel(getCategoryMeta(article.category), language)}</span>
                <strong>{article.title}</strong>
                <span>{article.titleEn}</span>
              </Link>
            ))}
            {visibleEntries.length > (compact ? 4 : 6) && <p className="map-result-more"><BilingualText zh={`還有 ${visibleEntries.length - (compact ? 4 : 6)} 篇近七日報導隨視窗同步。`} en={`${visibleEntries.length - (compact ? 4 : 6)} more recent reports follow this viewport.`} /></p>}
            {visibleEntries.length === 0 && <div className="map-empty"><BilingualText zh="請拖曳地圖至其他地區，或使用上方快速定位。" en="Pan to another region or use a focus shortcut above." block /></div>}
          </div>
        </aside>
      </div>

      <section ref={regionDetailsRef} id="map-region-details" className="map-region-details" aria-labelledby="map-region-details-title" aria-live="polite">
        <div className="map-region-details-header">
          <div>
            <p className="map-eyebrow"><BilingualText zh="區域詳情 // 點擊節點後載入" en="REGION DETAIL // NODE SELECTION" /></p>
            <h3 id="map-region-details-title" className="font-orbitron text-xl font-bold text-cyan-100 sm:text-2xl">
              {selectedRegionGeo ? <BilingualText zh={`${selectedRegionGeo.label}｜近七日相關新聞`} en={`${selectedRegionGeo.labelEn} | LAST 7 DAYS REPORTS`} /> : <BilingualText zh="點擊地圖節點查看區域新聞" en="CLICK A MAP NODE TO VIEW REGIONAL NEWS" />}
            </h3>
          </div>
          <span className="map-region-details-count">{selectedRegionEntries.length}</span>
        </div>

        {selectedRegionGeo ? (
          <div className="map-region-details-body">
            <div className="map-region-detail-summary">
              <span className="map-detail-location">{displayGeoLabel(selectedRegionGeo, language)} · {displayRegionLabel(selectedRegionGeo.region, language)}</span>
              <span className="map-detail-filter-status"><BilingualText zh={isShowingAllTopics ? '目前顯示全部領域' : `沿用 ${selectedTopics.length} 個已選領域`} en={isShowingAllTopics ? 'SHOWING ALL TOPICS' : `KEEPING ${selectedTopics.length} SELECTED TOPICS`} /></span>
              {selectedCategorySummary.map(({ category, count }) => (
                <span key={category.key} className="map-detail-category">
                  <i aria-hidden="true" style={{ backgroundColor: category.color }} />
                  <BilingualText zh={category.label} en={category.labelEn} /> <b>{count}</b>
                </span>
              ))}
            </div>
            <div className="map-detail-topic-controls-shell">
              <button
                type="button"
                className={`map-detail-filter-toggle ${isDetailTopicMenuOpen ? 'is-open' : ''}`}
                onClick={() => setIsDetailTopicMenuOpen((current) => !current)}
                aria-expanded={isDetailTopicMenuOpen}
                aria-controls="map-detail-topic-controls"
              >
                <BilingualText zh="篩選此區新聞" en="FILTER THIS REGION" />
                <span aria-hidden="true">⌄</span>
              </button>
              <div id="map-detail-topic-controls" className={`map-detail-topic-controls ${isDetailTopicMenuOpen ? 'is-open' : ''}`} aria-label="區域新聞領域篩選">
                <span className="map-detail-topic-label"><BilingualText zh="調整此區域領域" en="REFINE THIS REGION" /></span>
                <button type="button" className={`map-category-chip map-category-chip-button ${isShowingAllTopics ? 'is-active' : ''}`} onClick={clearTopicSelection} aria-pressed={isShowingAllTopics}>
                  <i aria-hidden="true" className="map-category-all-dot" />
                  <BilingualText zh="全部" en="ALL" />
                </button>
                {categoryLegend.map((category) => {
                  const isSelected = selectedTopics.includes(category.key);
                  return (
                    <button
                      key={`detail-${category.key}`}
                      type="button"
                      className={`map-category-chip map-category-chip-button ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => toggleTopic(category.key)}
                      aria-pressed={isSelected}
                      style={isSelected ? { borderColor: category.color, color: category.color } : undefined}
                    >
                      <i aria-hidden="true" style={{ backgroundColor: category.color }} />
                      {isSelected && <span aria-hidden="true" className="map-topic-check">✓</span>}
                      <BilingualText zh={category.label} en={category.labelEn} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="map-region-detail-list">
              {selectedRegionEntries.map(({ article, geo }) => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="map-region-detail-item">
                  <span className="map-result-meta">{article.date} · {displayCategoryLabel(getCategoryMeta(article.category), language)}</span>
                  <strong>{article.title}</strong>
                  <span>{article.titleEn}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="map-empty map-region-details-empty"><BilingualText zh="點擊地圖上任一彩色節點，頁面會自動滑到這裡並顯示該區域的近七日新聞。" en="Click any colored node to jump here and load the region's recent reports." block /></div>
        )}
      </section>
    </section>
  );
}
