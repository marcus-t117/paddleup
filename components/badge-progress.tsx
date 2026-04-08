'use client';

import type { BadgeDefinition, Player, Game } from '@/types';

interface BadgeProgressProps {
  badge: BadgeDefinition;
  player: Player;
  games: Game[];
}

export default function BadgeProgress({ badge, player, games }: BadgeProgressProps) {
  const progress = badge.progress?.(player, games);
  if (!progress) return null;

  const percent = Math.min((progress.current / progress.target) * 100, 100);

  return (
    <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined text-xl">{badge.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-on-surface text-sm">{badge.name}</h3>
        <p className="text-on-surface-variant text-xs font-medium truncate">{badge.description}</p>
        <div className="mt-2 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-bold text-on-surface-variant whitespace-nowrap">
        {progress.current}/{progress.target}
      </span>
    </div>
  );
}
