'use client';

import type { Game, Player } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { getInitials, getAvatarColour } from '@/lib/utils';

interface MatchResultCardProps {
  game: Game;
  userId: string;
  players: Player[];
}

export default function MatchResultCard({ game, userId, players }: MatchResultCardProps) {
  const isOnPlayerSide = game.playerIds.includes(userId);
  const won = (isOnPlayerSide && game.winner === 'player') || (!isOnPlayerSide && game.winner === 'opponent');

  const myScore = isOnPlayerSide ? game.playerScore : game.opponentScore;
  const theirScore = isOnPlayerSide ? game.opponentScore : game.playerScore;
  const eloDelta = game.eloChanges[userId] || 0;

  const opponentIds = isOnPlayerSide ? game.opponentIds : game.playerIds;
  const partnerIds = isOnPlayerSide
    ? game.playerIds.filter(id => id !== userId)
    : game.opponentIds.filter(id => id !== userId);

  return (
    <div className={`p-5 rounded-[1.5rem] ${won ? 'bg-surface-container-lowest' : 'bg-surface-container-low opacity-80'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          won ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-on-surface-variant'
        }`}>
          <span className="material-symbols-outlined" style={won ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {won ? 'check_circle' : 'close'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-on-surface uppercase tracking-wide text-sm">
            {won ? 'Victory' : 'Close Loss'}
          </h3>
          <p className="text-on-surface-variant text-xs font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">calendar_today</span>
            {formatDateTime(game.date)}
          </p>
        </div>
        <div className="text-right">
          <span className={`block text-xl font-black font-[family-name:var(--font-headline)] leading-none ${
            won ? 'text-primary' : 'text-on-surface-variant'
          }`}>
            {myScore} - {theirScore}
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Final Score
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Opponent avatars */}
          <div className="flex -space-x-2">
            {opponentIds.map(id => {
              const p = players.find(pl => pl.id === id);
              if (!p) return null;
              return (
                <div
                  key={id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-surface-container-lowest"
                  style={{ backgroundColor: getAvatarColour(p.name), color: '#d9ffad' }}
                >
                  {getInitials(p.name)}
                </div>
              );
            })}
          </div>
          {partnerIds.length > 0 && (
            <span className="text-xs text-on-surface-variant font-medium">
              Partner: {partnerIds.map(id => players.find(p => p.id === id)?.name || 'Unknown').join(', ')}
            </span>
          )}
        </div>
        {game.venue && (
          <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {game.venue}
          </span>
        )}
      </div>
    </div>
  );
}
