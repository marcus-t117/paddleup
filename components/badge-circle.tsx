'use client';

import type { BadgeDefinition } from '@/types';
import { getBadgeTierColour } from '@/lib/badges';

interface BadgeCircleProps {
  badge: BadgeDefinition;
  unlocked: boolean;
}

export default function BadgeCircle({ badge, unlocked }: BadgeCircleProps) {
  const tierColour = getBadgeTierColour(badge.tier);

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-outline">lock</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline text-center leading-tight max-w-[80px]">
          {badge.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_32px_rgba(0,0,0,0.06)]"
        style={{ backgroundColor: tierColour }}
      >
        <span
          className="material-symbols-outlined text-2xl icon-filled"
          style={{ color: badge.tier === 'platinum' ? '#345c00' : '#fff' }}
        >
          {badge.icon}
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface text-center leading-tight max-w-[80px]">
        {badge.name}
      </span>
    </div>
  );
}
