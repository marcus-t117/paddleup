'use client';

import { useState, useRef, useCallback } from 'react';
import type { EloSnapshot } from '@/types';
import { formatDate } from '@/lib/utils';
import { format } from 'date-fns';

interface EloChartProps {
  history: EloSnapshot[];
  onClose: () => void;
}

export default function EloChart({ history, onClose }: EloChartProps) {
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (history.length < 2) return null;

  const elos = history.map(h => h.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 100;
  const padding = range * 0.15;
  const chartMin = Math.floor(minElo - padding);
  const chartMax = Math.ceil(maxElo + padding);
  const chartRange = chartMax - chartMin;

  // Layout with left margin for y-axis
  const width = 600;
  const height = 200;
  const marginLeft = 50;
  const marginRight = 10;
  const marginTop = 10;
  const marginBottom = 5;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  const points = history.map((h, i) => ({
    x: marginLeft + (i / (history.length - 1)) * chartWidth,
    y: marginTop + chartHeight - ((h.elo - chartMin) / chartRange) * chartHeight,
    elo: h.elo,
    date: h.date,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${marginTop + chartHeight} L ${points[0].x} ${marginTop + chartHeight} Z`;

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const totalChange = lastPoint.elo - firstPoint.elo;

  // Y-axis tick marks (3-5 ticks)
  const tickCount = 4;
  const yTicks: number[] = [];
  const step = Math.ceil(chartRange / tickCount / 10) * 10;
  const tickStart = Math.ceil(chartMin / step) * step;
  for (let v = tickStart; v <= chartMax; v += step) {
    yTicks.push(v);
  }

  // Scrub: active point
  const activePoint = scrubIndex !== null ? points[scrubIndex] : null;
  const activeData = scrubIndex !== null ? history[scrubIndex] : null;

  // Handle pointer interaction for scrubbing
  const getIndexFromEvent = useCallback((clientX: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * width;
    // Find closest point
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    return closest;
  }, [points, width]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const idx = getIndexFromEvent(e.clientX);
    if (idx !== null) setScrubIndex(idx);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (scrubIndex === null) return;
    const idx = getIndexFromEvent(e.clientX);
    if (idx !== null) setScrubIndex(idx);
  };

  const handlePointerUp = () => {
    setScrubIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
              Rating History
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-[family-name:var(--font-headline)] text-on-surface">
                {(activeData?.elo ?? lastPoint.elo).toLocaleString()}
              </span>
              {activeData ? (
                <span className="text-xs font-medium text-on-surface-variant">
                  {format(new Date(activeData.date), 'EEE d MMM')}
                </span>
              ) : (
                <span className={`text-sm font-bold ${totalChange >= 0 ? 'text-primary' : 'text-error'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="w-full overflow-hidden rounded-[1rem] bg-surface-container-low p-4 touch-none select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            preserveAspectRatio="none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <defs>
              <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#96fc00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#96fc00" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines and labels */}
            {yTicks.map(v => {
              const y = marginTop + chartHeight - ((v - chartMin) / chartRange) * chartHeight;
              return (
                <g key={v}>
                  <line x1={marginLeft} y1={y} x2={width - marginRight} y2={y} stroke="#abaea9" strokeOpacity="0.2" strokeWidth="1" />
                  <text x={marginLeft - 8} y={y + 4} textAnchor="end" fill="#595c59" fontSize="11" fontFamily="Be Vietnam Pro, sans-serif">
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Fill area */}
            <path d={areaPath} fill="url(#eloGradient)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#3a6700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Scrub indicator */}
            {activePoint && (
              <>
                <line x1={activePoint.x} y1={marginTop} x2={activePoint.x} y2={marginTop + chartHeight} stroke="#3a6700" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                <circle cx={activePoint.x} cy={activePoint.y} r="7" fill="#96fc00" stroke="#3a6700" strokeWidth="2.5" />
              </>
            )}

            {/* Default end dot (only when not scrubbing) */}
            {scrubIndex === null && (
              <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill="#96fc00" stroke="#3a6700" strokeWidth="2" />
            )}
          </svg>
        </div>

        <div className="flex justify-between mt-3 text-[10px] font-medium text-on-surface-variant">
          <span>{formatDate(firstPoint.date)}</span>
          <span>{formatDate(lastPoint.date)}</span>
        </div>
      </div>
    </div>
  );
}
