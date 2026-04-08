'use client';

import type { EloSnapshot } from '@/types';
import { formatDate } from '@/lib/utils';

interface EloChartProps {
  history: EloSnapshot[];
  onClose: () => void;
}

export default function EloChart({ history, onClose }: EloChartProps) {
  if (history.length < 2) return null;

  const elos = history.map(h => h.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 100;
  const padding = range * 0.15;
  const chartMin = Math.floor(minElo - padding);
  const chartMax = Math.ceil(maxElo + padding);
  const chartRange = chartMax - chartMin;

  const width = 600;
  const height = 200;
  const marginLeft = 0;
  const marginRight = 0;

  const points = history.map((h, i) => ({
    x: marginLeft + (i / (history.length - 1)) * (width - marginLeft - marginRight),
    y: height - ((h.elo - chartMin) / chartRange) * height,
    elo: h.elo,
    date: h.date,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient fill area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const totalChange = lastPoint.elo - firstPoint.elo;

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
                {lastPoint.elo.toLocaleString()}
              </span>
              <span className={`text-sm font-bold ${totalChange >= 0 ? 'text-primary' : 'text-error'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="w-full overflow-hidden rounded-[1rem] bg-surface-container-low p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#96fc00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#96fc00" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Fill area */}
            <path d={areaPath} fill="url(#eloGradient)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#3a6700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Current point dot */}
            <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill="#96fc00" stroke="#3a6700" strokeWidth="2" />
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
