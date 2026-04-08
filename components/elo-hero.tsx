'use client';

import type { Player } from '@/types';
import { getPlayerRank, getWeeklyEloChange } from '@/lib/utils';

interface EloHeroProps {
  player: Player;
  allPlayers: Player[];
}

export default function EloHero({ player, allPlayers }: EloHeroProps) {
  const rank = getPlayerRank(player, allPlayers);
  const weeklyChange = getWeeklyEloChange(player);

  return (
    <div className="bg-gradient-to-br from-primary to-primary-dim p-6 rounded-[2rem] text-on-primary flex justify-between items-end relative overflow-hidden hover:scale-[1.01] transition-transform active:scale-[0.99]">
      <div className="relative z-10">
        <span className="text-on-primary/70 text-xs font-bold uppercase tracking-widest block mb-1">
          Current Rating
        </span>
        <div className="text-6xl font-black font-[family-name:var(--font-headline)] leading-none italic">
          {player.elo.toLocaleString()}
        </div>
        {weeklyChange !== 0 && (
          <div className="mt-4 flex items-center gap-2 bg-on-primary/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">
              {weeklyChange > 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className="text-xs font-bold">
              {weeklyChange > 0 ? '+' : ''}{weeklyChange} pts this week
            </span>
          </div>
        )}
      </div>
      <div className="relative z-10 text-right">
        <span className="text-on-primary/70 text-xs font-bold uppercase tracking-widest block mb-1">
          Global Rank
        </span>
        <div className="text-3xl font-bold font-[family-name:var(--font-headline)] leading-none">
          #{rank}
        </div>
      </div>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl -mr-10 -mt-10" />
    </div>
  );
}
