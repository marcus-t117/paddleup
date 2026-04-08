'use client';

import type { BadgeDefinition } from '@/types';

// Each badge gets a unique visual identity
const BADGE_STYLES: Record<string, { bg: string; ring: string; glow: string; iconColor: string }> = {
  'flash-serve':      { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', ring: '#fbbf24', glow: 'rgba(251, 191, 36, 0.3)', iconColor: '#fff' },
  'hot-streak':       { bg: 'linear-gradient(135deg, #dc2626, #f97316)', ring: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', iconColor: '#fff' },
  'inferno':          { bg: 'linear-gradient(135deg, #9a3412, #dc2626)', ring: '#b91c1c', glow: 'rgba(185, 28, 28, 0.35)', iconColor: '#fef2f2' },
  'season-vet':       { bg: 'linear-gradient(135deg, #475569, #64748b)', ring: '#94a3b8', glow: 'rgba(148, 163, 184, 0.25)', iconColor: '#f1f5f9' },
  'dink-king':        { bg: 'linear-gradient(135deg, #3a6700, #65a30d)', ring: '#84cc16', glow: 'rgba(132, 204, 22, 0.3)', iconColor: '#ecfccb' },
  'iron-defence':     { bg: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', ring: '#60a5fa', glow: 'rgba(96, 165, 250, 0.3)', iconColor: '#eff6ff' },
  'atp-master':       { bg: 'linear-gradient(135deg, #3a6700, #96fc00)', ring: '#96fc00', glow: 'rgba(150, 252, 0, 0.3)', iconColor: '#345c00' },
  'giant-killer':     { bg: 'linear-gradient(135deg, #7c2d12, #ea580c)', ring: '#fb923c', glow: 'rgba(251, 146, 60, 0.3)', iconColor: '#fff7ed' },
  'community-legend': { bg: 'linear-gradient(135deg, #6d28d9, #a855f7)', ring: '#c084fc', glow: 'rgba(192, 132, 252, 0.3)', iconColor: '#faf5ff' },
  'century-club':     { bg: 'linear-gradient(135deg, #065f46, #10b981)', ring: '#34d399', glow: 'rgba(52, 211, 153, 0.3)', iconColor: '#ecfdf5' },
  'court-dominator':  { bg: 'linear-gradient(135deg, #345c00, #96fc00)', ring: '#96fc00', glow: 'rgba(150, 252, 0, 0.4)', iconColor: '#1a2e00' },
  'perfect-week':     { bg: 'linear-gradient(135deg, #0369a1, #38bdf8)', ring: '#7dd3fc', glow: 'rgba(125, 211, 252, 0.3)', iconColor: '#f0f9ff' },
};

const TIER_RING_WIDTH: Record<string, string> = {
  bronze: '2px',
  silver: '2px',
  gold: '3px',
  platinum: '3px',
};

interface BadgeCircleProps {
  badge: BadgeDefinition;
  unlocked: boolean;
}

export default function BadgeCircle({ badge, unlocked }: BadgeCircleProps) {
  const style = BADGE_STYLES[badge.id];
  const ringWidth = TIER_RING_WIDTH[badge.tier] || '2px';

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-[72px] h-[72px] rounded-full bg-surface-container-high/60 flex items-center justify-center relative">
          <span className="material-symbols-outlined text-2xl text-outline/50">lock</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline text-center leading-tight max-w-[80px]">
          {badge.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Outer glow ring */}
      <div
        className="w-[76px] h-[76px] rounded-full flex items-center justify-center p-[2px]"
        style={{
          boxShadow: style ? `0 0 20px ${style.glow}, 0 0 40px ${style.glow}` : undefined,
        }}
      >
        {/* Ring border */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            padding: ringWidth,
            background: style?.ring || '#abaea9',
          }}
        >
          {/* Badge face */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ background: style?.bg || '#535c69' }}
          >
            {/* Shimmer overlay for gold/platinum */}
            {(badge.tier === 'gold' || badge.tier === 'platinum') && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                }}
              />
            )}
            <span
              className="material-symbols-outlined text-[28px] relative z-10"
              style={{
                fontVariationSettings: "'FILL' 1, 'wght' 500",
                color: style?.iconColor || '#fff',
              }}
            >
              {badge.icon}
            </span>
          </div>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface text-center leading-tight max-w-[80px]">
        {badge.name}
      </span>
    </div>
  );
}
