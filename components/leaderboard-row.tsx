'use client';

import type { Player } from '@/types';
import { getInitials, getAvatarColour } from '@/lib/utils';

interface LeaderboardRowProps {
  player: Player;
  rank: number;
  isUser: boolean;
}

export default function LeaderboardRow({ player, rank, isUser }: LeaderboardRowProps) {
  if (isUser) {
    return (
      <div className="bg-primary-container rounded-[1.5rem] p-4 flex items-center gap-3 shadow-lg shadow-primary-container/20">
        <span className="text-2xl font-black font-[family-name:var(--font-headline)] text-on-primary-container italic w-12 flex-shrink-0 text-center">
          #{rank}
        </span>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: getAvatarColour(player.name), color: '#d9ffad' }}
        >
          {getInitials(player.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-primary-container">{player.name}</span>
            <span className="text-[10px] font-bold text-on-primary-container/70">(YOU)</span>
          </div>
          {player.currentStreak >= 3 && (
            <span className="inline-block bg-on-primary-container/10 text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
              ON FIRE
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-xl font-black font-[family-name:var(--font-headline)] text-on-primary-container">
            {player.elo.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] flex items-center gap-3 hover:scale-[1.02] transition-transform">
      <span className="text-lg font-bold text-on-surface-variant w-12 flex-shrink-0 text-center">{rank < 10 ? `0${rank}` : rank}</span>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: getAvatarColour(player.name), color: '#d9ffad' }}
      >
        {getInitials(player.name)}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-on-surface">{player.name}</span>
        <div className="flex gap-1 mt-1">
          {player.recentForm.map((result, i) => (
            <div
              key={i}
              className={`w-5 h-1.5 rounded-full ${
                result === 'W' ? 'bg-primary' : 'bg-error'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold font-[family-name:var(--font-headline)] text-on-surface">
          {player.elo.toLocaleString()}
        </span>
        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          {player.recentForm.join('')}
        </div>
      </div>
    </div>
  );
}
