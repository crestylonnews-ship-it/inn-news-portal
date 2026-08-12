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

type Props = { articles: Article[] };

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 540;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4.4;
const REGIONS = [
  { label: '東亞', labelEn: 'EAST ASIA', lon: 122, lat: 30, zoom: 2.7 },
  { label: '東南亞', labelEn: 'SOUTHEAST ASIA', lon: 106, lat: 7, zoom: 3.1 },
  { label: '歐洲', labelEn: 'EUROPE', lon: 15, lat: 50, zoom: 2.8 },
  { label: '北美', labelEn: 'NORTH AMERICA', lon: -100, lat: 38, zoom: 2.1 },
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

export default function NewsMapExplorer({ articles }: Props) {
  const [viewport, setViewport] = useState<Viewport>({ centerLon: 20, centerLat: 18, zoom: 1.05 });
  const [geoJson, setGeoJson] = useState<GeoCollection | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; viewport: Viewport } | null>(null);
  const entries = useMemo(() => getArticleGeoEntries(articles), [articles]);
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
    () => entries.filter(({ geo }) => isVisible(geo.lon, geo.lat, bounds, geo.region)).sort((a, b) => new Date(b.article.date).getTime() - new Date(a.article.date).getTime()),
    [bounds, entries],
  );

  const groupedPoints = useMemo(() => {
    const groups = new Map<string, { geo: (typeof entries)[number]['geo']; count: number }>();
    visibleEntries.forEach(({ geo }) => {
      const current = groups.get(geo.key);
      groups.set(geo.key, current ? { ...current, count: current.count + 1 } : { geo, count: 1 });
    });
    return Array.from(groups.values()).sort((a, b) => b.count - a.count);
  }, [visibleEntries]);

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

  const resetViewport = () => setViewport({ centerLon: 20, centerLat: 18, zoom: 1.05 });

  const focusRegion = (lon: number, lat: number, zoom: number) => {
    const spanLon = 360 / zoom;
    const spanLat = 180 / zoom;
    setViewport({
      centerLon: clamp(lon, -180 + spanLon / 2, 180 - spanLon / 2),
      centerLat: clamp(lat, -90 + spanLat / 2, 90 - spanLat / 2),
      zoom,
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

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    updateZoom(event.deltaY > 0 ? -1 : 1);
  };

  return (
    <section id="map-explorer" className="map-explorer space-y-6" aria-labelledby="map-explorer-title">
      <div className="flex flex-col gap-4 border-b border-cyan-400/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="map-eyebrow"><BilingualText zh="測試功能 // 地理新聞索引" en="BETA MODULE // GEO NEWS INDEX" /></p>
          <h2 id="map-explorer-title" className="font-orbitron text-2xl font-black tracking-tight text-white sm:text-3xl"><BilingualText zh="移動地圖，重新讀取世界" en="MOVE THE MAP. RELOAD THE WORLD." /></h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400"><BilingualText zh="拖曳或縮放地圖，右側新聞串流會依目前畫面可見地區即時更新。這是以現有文章內容推定地理節點的前端測試層。" en="Pan or zoom the map to update the news stream on the right. This beta layer infers geographic nodes from the existing article content." block /></p>
        </div>
        <div className="map-readout" aria-live="polite">
          <span><BilingualText zh="目前視窗" en="VIEWPORT" /></span>
          <strong>{visibleEntries.length}</strong>
          <small><BilingualText zh="篇報導" en="REPORTS" /></small>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="map-console">
          <div className="map-console-bar">
            <div className="flex items-center gap-2">
              <span className="map-live-dot" aria-hidden="true" />
              <span><BilingualText zh="地理訊號在線" en="GEO SIGNAL ONLINE" /></span>
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
                <filter id="map-marker-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-glow)" />
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-grid)" />
              <g className="world-land" aria-hidden="true">
                {mapPaths.map(({ key, path, name }) => <path key={key} d={`M ${path}`} vectorEffect="non-scaling-stroke" aria-label={name} />)}
              </g>
              <g className="map-latitude-lines" aria-hidden="true">
                {[-60, -30, 0, 30, 60].map((lat) => { const p = project(0, lat, viewport); return <line key={lat} x1="0" x2={MAP_WIDTH} y1={p.y} y2={p.y} />; })}
              </g>
              <g className="map-points" aria-label="新聞地理節點">
                {groupedPoints.map(({ geo, count }) => {
                  const point = project(geo.lon, geo.lat, viewport);
                  const radius = Math.min(18, 7 + Math.sqrt(count) * 2.4);
                  return (
                    <g key={geo.key} transform={`translate(${point.x} ${point.y})`} className="map-point" filter="url(#map-marker-glow)">
                      <circle r={radius + 6} className="map-point-halo" />
                      <circle r={radius} className="map-point-core" />
                      <text y={-radius - 5} textAnchor="middle" className="map-point-label">{geo.label}</text>
                      <text y={radius + 14} textAnchor="middle" className="map-point-count">{count}</text>
                    </g>
                  );
                })}
              </g>
              <g className="map-crosshair" aria-hidden="true">
                <path d={`M ${MAP_WIDTH / 2 - 12} ${MAP_HEIGHT / 2} H ${MAP_WIDTH / 2 + 12} M ${MAP_WIDTH / 2} ${MAP_HEIGHT / 2 - 12} V ${MAP_HEIGHT / 2 + 12}`} />
              </g>
            </svg>
            <div className="map-overlay-label map-overlay-label-top"><BilingualText zh="拖曳平移 · 滾輪縮放" en="DRAG TO PAN · WHEEL TO ZOOM" /></div>
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
              <p className="map-eyebrow"><BilingualText zh="範圍結果" en="BOUNDS RESULT" /></p>
              <h3 id="map-results-title" className="font-orbitron text-lg font-bold text-cyan-100"><BilingualText zh="畫面中的新聞" en="REPORTS IN VIEW" /></h3>
            </div>
            <span className="map-result-count">{visibleEntries.length}</span>
          </div>
          <div className="map-region-summary">
            {groupedPoints.slice(0, 5).map(({ geo, count }) => <span key={geo.key}>{geo.label} <b>{count}</b></span>)}
            {groupedPoints.length === 0 && <span><BilingualText zh="此視窗目前沒有定位訊號" en="NO GEO SIGNAL IN THIS VIEW" /></span>}
          </div>
          <div className="map-result-list">
            {visibleEntries.slice(0, 6).map(({ article, geo }) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="map-result-item">
                <span className="map-result-meta">{geo.label} · {article.date}</span>
                <strong>{article.title}</strong>
                <span>{article.titleEn}</span>
              </Link>
            ))}
            {visibleEntries.length > 6 && <p className="map-result-more"><BilingualText zh={`還有 ${visibleEntries.length - 6} 篇報導隨視窗同步。`} en={`${visibleEntries.length - 6} more reports follow this viewport.`} /></p>}
            {visibleEntries.length === 0 && <div className="map-empty"><BilingualText zh="請拖曳地圖至其他地區，或使用上方快速定位。" en="Pan to another region or use a focus shortcut above." block /></div>}
          </div>
        </aside>
      </div>
    </section>
  );
}
