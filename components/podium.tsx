'use client';

import type { Player } from '@/types';
import { getInitials, getAvatarColour } from '@/lib/utils';

interface PodiumProps {
  players: Player[]; // top 3, sorted by ELO desc
}

export default function Podium({ players }: PodiumProps) {
  const [first, second, third] = players;

  return (
    <div className="flex items-end justify-center gap-3 pt-8 pb-4">
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute -top-2 -left-2 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
              2ND
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-outline-variant/30"
              style={{ backgroundColor: getAvatarColour(second.name), color: '#d9ffad' }}
            >
              {getInitials(second.name)}
            </div>
          </div>
          <span className="text-xs font-medium text-on-surface truncate max-w-[80px]">{second.name}</span>
          <span className="text-sm font-bold text-on-surface-variant">{second.elo.toLocaleString()}</span>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="flex flex-col items-center gap-2 -mt-4">
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="material-symbols-outlined text-primary-fixed text-2xl icon-filled">emoji_events</span>
            </div>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-3 border-primary-fixed bg-primary-container shadow-lg shadow-primary-fixed/20"
              style={{ color: '#345c00' }}
            >
              {getInitials(first.name)}
            </div>
          </div>
          <span className="text-sm font-bold text-on-surface">{first.name}</span>
          <span className="text-lg font-black font-[family-name:var(--font-headline)] text-primary">{first.elo.toLocaleString()}</span>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
              3RD
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-tertiary-container/50"
              style={{ backgroundColor: getAvatarColour(third.name), color: '#fff0ea' }}
            >
              {getInitials(third.name)}
            </div>
          </div>
          <span className="text-xs font-medium text-on-surface truncate max-w-[80px]">{third.name}</span>
          <span className="text-sm font-bold text-on-surface-variant">{third.elo.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
