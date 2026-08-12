'use client';

import Link from 'next/link';
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Article } from '@/lib/types';
import { getArticleGeoEntries } from '@/lib/geo';
import BilingualText from './BilingualText';

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
  color: string;
  keywords: string[];
};

type Props = { articles: Article[] };

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 540;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4.4;
const RECENT_DAYS = 7;
const REGIONS = [
  { label: '東亞', labelEn: 'EAST ASIA', lon: 122, lat: 30, zoom: 2.7 },
  { label: '東南亞', labelEn: 'SOUTHEAST ASIA', lon: 106, lat: 7, zoom: 3.1 },
  { label: '歐洲', labelEn: 'EUROPE', lon: 15, lat: 50, zoom: 2.8 },
  { label: '北美', labelEn: 'NORTH AMERICA', lon: -100, lat: 38, zoom: 2.1 },
];

const CATEGORY_META: CategoryMeta[] = [
  { key: 'politics', label: '政治與國際', labelEn: 'POLITICS & WORLD', short: '政', color: '#fb7185', keywords: ['政治', '國際', '政府', '外交', '司法', '選舉', '安全', '戰爭', '地緣', 'politic', 'government', 'election', 'security', 'war', 'world', 'international'] },
  { key: 'technology', label: '科技與數位', labelEn: 'TECH & DIGITAL', short: '科', color: '#38bdf8', keywords: ['科技', '資訊', '資安', '人工智慧', '軟體', '數位', 'technology', 'software', 'cyber', 'digital', 'artificial intelligence', 'ai'] },
  { key: 'business', label: '經濟與商業', labelEn: 'BUSINESS & ECONOMY', short: '經', color: '#f59e0b', keywords: ['金融', '銀行', '保險', '能源', '物流', '零售', '電商', '經濟', '商業', '財經', '產業', '市場', 'business', 'economy', 'finance', 'energy', 'retail', 'market'] },
  { key: 'society', label: '社會與生活', labelEn: 'SOCIETY & LIFE', short: '社', color: '#a78bfa', keywords: ['社會', '教育', '青少年', '勞動', '薪資', '住宅', '居住', '民生', '弱勢', '長照', '街友', '貧富', 'social', 'education', 'labor', 'housing', 'community'] },
  { key: 'health', label: '醫療與健康', labelEn: 'HEALTH & MEDICINE', short: '醫', color: '#34d399', keywords: ['醫療', '健康', '生技', 'medical', 'health', 'biotech'] },
  { key: 'environment', label: '環境與氣候', labelEn: 'CLIMATE & ENVIRONMENT', short: '環', color: '#2dd4bf', keywords: ['環境', '氣候', '永續', '公害', '交通', 'environment', 'climate', 'sustainability', 'pollution'] },
  { key: 'culture', label: '文化與媒體', labelEn: 'CULTURE & MEDIA', short: '文', color: '#f472b6', keywords: ['媒體', '新聞', '出版', '文化', '體育', '運動', 'media', 'culture', 'sports', 'publishing'] },
  { key: 'other', label: '其他', labelEn: 'OTHER SIGNALS', short: '他', color: '#94a3b8', keywords: [] },
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

export default function NewsMapExplorer({ articles }: Props) {
  const [viewport, setViewport] = useState<Viewport>({ centerLon: 20, centerLat: 18, zoom: 1.05 });
  const [geoJson, setGeoJson] = useState<GeoCollection | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; viewport: Viewport } | null>(null);
  const regionDetailsRef = useRef<HTMLElement | null>(null);
  const entries = useMemo(() => getArticleGeoEntries(articles), [articles]);
  const recentEntries = useMemo(() => entries.filter(({ article }) => isWithinLastSevenDays(article)), [entries]);
  const bounds = useMemo(() => getBounds(viewport), [viewport]);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/world-countries.geojson')
      .then((response) => response.json())
      .then((data: GeoCollection) => {
        if (!cancelled) setGeoJson(data);
      })
      .catch(() => {
        if (!cancelled) setGeoJson(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    recentEntries.forEach(({ article }) => {
      const category = getCategoryMeta(article.category);
      counts.set(category.key, (counts.get(category.key) || 0) + 1);
    });
    return CATEGORY_META
      .filter((category) => counts.has(category.key))
      .map((category) => ({ ...category, count: counts.get(category.key) || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [recentEntries]);

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
    setViewport({ centerLon: 20, centerLat: 18, zoom: 1.05 });
  };

  const focusRegion = (lon: number, lat: number, zoom: number) => {
    const spanLon = 360 / zoom;
    const spanLat = 180 / zoom;
    setViewport({
      centerLon: clamp(lon, -180 + spanLon / 2, 180 - spanLon / 2),
      centerLat: clamp(lat, -90 + spanLat / 2, 90 - spanLat / 2),
      zoom,
    });
  };

  const handleRegionPointClick = (regionKey: string) => {
    setSelectedRegionKey(regionKey);
    window.setTimeout(() => regionDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
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

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    updateZoom(event.deltaY > 0 ? -1 : 1);
  };

  return (
    <section id="map-explorer" className="map-explorer space-y-6" aria-labelledby="map-explorer-title">
      <div className="flex flex-col gap-4 border-b border-cyan-400/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="map-eyebrow"><BilingualText zh="測試功能 // 近七日地理新聞索引" en="BETA MODULE // LAST 7 DAYS GEO INDEX" /></p>
          <h2 id="map-explorer-title" className="font-orbitron text-2xl font-black tracking-tight text-white sm:text-3xl"><BilingualText zh="移動地圖，重新讀取近一週世界" en="MOVE THE MAP. RELOAD THE LAST 7 DAYS." /></h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400"><BilingualText zh="地圖只顯示最近 7 天的新聞。地區新聞越多，節點越大；不同分類使用不同顏色。點擊節點後，頁面會滑到下方顯示該區域的完整相關新聞。" en="The map shows reports from the last 7 days only. More reports create larger nodes, while categories use distinct colors. Click a node to jump to its full regional news list below." block /></p>
        </div>
        <div className="map-readout" aria-live="polite">
          <span><BilingualText zh="近 7 日資料" en="LAST 7 DAYS" /></span>
          <strong>{recentEntries.length}</strong>
          <small><BilingualText zh="篇報導" en="REPORTS" /></small>
        </div>
      </div>

      <div className="map-category-legend" aria-label="新聞分類圖例">
        <span className="map-category-legend-label"><BilingualText zh="分類色彩" en="CATEGORY COLORS" /></span>
        {categoryLegend.map((category) => (
          <span key={category.key} className="map-category-chip">
            <i aria-hidden="true" style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}` }} />
            <BilingualText zh={category.label} en={category.labelEn} />
            <b>{category.count}</b>
          </span>
        ))}
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
              className={`world-map ${dragging ? 'is-dragging' : ''}`}
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="application"
              aria-label="可拖曳縮放的世界地圖 / Draggable and zoomable world map"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
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
              <g className="map-latitude-lines" aria-hidden="true">
                {[-60, -30, 0, 30, 60].map((lat) => { const p = project(0, lat, viewport); return <line key={lat} x1="0" x2={MAP_WIDTH} y1={p.y} y2={p.y} />; })}
              </g>
              <g className="map-points" aria-label="近七日新聞地理節點">
                {groupedPoints.map(({ geo, category, count, totalCount, offsetX, offsetY }) => {
                  const point = project(geo.lon, geo.lat, viewport);
                  const radius = Math.min(26, 6.5 + Math.sqrt(count) * 2.8 + Math.log2(totalCount + 1) * 1.2);
                  const isSelected = selectedRegionKey === geo.key;
                  return (
                    <g
                      key={`${geo.key}:${category.key}`}
                      transform={`translate(${point.x + offsetX} ${point.y + offsetY})`}
                      className={`map-point ${isSelected ? 'is-selected' : ''}`}
                      style={{ color: category.color }}
                      data-selected={isSelected}
                      role="button"
                      tabIndex={0}
                      aria-label={`${geo.label} ${category.label} ${count} 篇近七日新聞`}
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
                      <text y={-radius - 5} textAnchor="middle" className="map-point-label">{geo.label} · {category.short}</text>
                      <text y={radius + 14} textAnchor="middle" className="map-point-count">{count}</text>
                    </g>
                  );
                })}
              </g>
              <g className="map-crosshair" aria-hidden="true">
                <path d={`M ${MAP_WIDTH / 2 - 12} ${MAP_HEIGHT / 2} H ${MAP_WIDTH / 2 + 12} M ${MAP_WIDTH / 2} ${MAP_HEIGHT / 2 - 12} V ${MAP_HEIGHT / 2 + 12}`} />
              </g>
            </svg>
            <div className="map-overlay-label map-overlay-label-top"><BilingualText zh="拖曳平移 · 滾輪縮放 · 點擊節點看區域新聞" en="DRAG · ZOOM · CLICK A NODE FOR REGIONAL NEWS" /></div>
            <div className="map-overlay-label map-overlay-label-bottom">LAT {viewport.centerLat.toFixed(1)}° / LON {viewport.centerLon.toFixed(1)}° / Z{viewport.zoom.toFixed(1)}</div>
            <div className="map-controls" aria-label="地圖控制">
              <button type="button" onClick={() => updateZoom(1)} aria-label="放大地圖">+</button>
              <button type="button" onClick={() => updateZoom(-1)} aria-label="縮小地圖">−</button>
              <button type="button" onClick={resetViewport} aria-label="重設地圖視窗">⌂</button>
            </div>
          </div>

          <div className="map-region-bar" aria-label="快速定位區域">
            <span className="map-region-label"><BilingualText zh="快速鎖定" en="FOCUS" /></span>
            {REGIONS.map((region) => (
              <button key={region.label} type="button" onClick={() => focusRegion(region.lon, region.lat, region.zoom)} className="map-region-chip">
                <BilingualText zh={region.label} en={region.labelEn} />
              </button>
            ))}
          </div>
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
            {regionSummaries.slice(0, 5).map(({ geo, count }) => <span key={geo.key}>{geo.label} <b>{count}</b></span>)}
            {regionSummaries.length === 0 && <span><BilingualText zh="此視窗目前沒有近七日定位訊號" en="NO RECENT GEO SIGNAL IN THIS VIEW" /></span>}
          </div>
          <div className="map-result-list">
            {visibleEntries.slice(0, 6).map(({ article, geo }) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="map-result-item">
                <span className="map-result-meta">{geo.label} · {article.date} · {getCategoryMeta(article.category).label}</span>
                <strong>{article.title}</strong>
                <span>{article.titleEn}</span>
              </Link>
            ))}
            {visibleEntries.length > 6 && <p className="map-result-more"><BilingualText zh={`還有 ${visibleEntries.length - 6} 篇近七日報導隨視窗同步。`} en={`${visibleEntries.length - 6} more recent reports follow this viewport.`} /></p>}
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
              <span className="map-detail-location">{selectedRegionGeo.label} · {selectedRegionGeo.region}</span>
              {selectedCategorySummary.map(({ category, count }) => (
                <span key={category.key} className="map-detail-category">
                  <i aria-hidden="true" style={{ backgroundColor: category.color }} />
                  <BilingualText zh={category.label} en={category.labelEn} /> <b>{count}</b>
                </span>
              ))}
            </div>
            <div className="map-region-detail-list">
              {selectedRegionEntries.map(({ article, geo }) => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="map-region-detail-item">
                  <span className="map-result-meta">{article.date} · {getCategoryMeta(article.category).label}</span>
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
