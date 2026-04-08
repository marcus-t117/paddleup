'use client';

import { useState, useEffect, useRef } from 'react';
import type { Game, Player } from '@/types';
import { formatDateTime, getInitials, getAvatarColour, getEloTier } from '@/lib/utils';

interface MatchResultCardProps {
  game: Game;
  userId: string;
  players: Player[];
}

function TappableAvatar({ player, className }: { player: Player; className?: string }) {
  const [showName, setShowName] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showName) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowName(false);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [showName]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setShowName(!showName)}
        className={`rounded-full flex items-center justify-center font-bold ring-2 ring-surface-container-lowest ${className || 'w-7 h-7 text-[10px]'}`}
        style={{ backgroundColor: getAvatarColour(player.name), color: '#d9ffad' }}
      >
        {getInitials(player.name)}
      </button>
      {showName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-[0.75rem] text-xs font-medium whitespace-nowrap z-20 shadow-lg">
          <div className="font-bold">{player.name}</div>
          <div className="text-[10px] opacity-70">{player.elo} ELO · {getEloTier(player.elo)}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-inverse-surface" />
        </div>
      )}
    </div>
  );
}

export default function MatchResultCard({ game, userId, players }: MatchResultCardProps) {
  const isOnPlayerSide = game.playerIds.includes(userId);
  const won = (isOnPlayerSide && game.winner === 'player') || (!isOnPlayerSide && game.winner === 'opponent');

  const myScore = isOnPlayerSide ? game.playerScore : game.opponentScore;
  const theirScore = isOnPlayerSide ? game.opponentScore : game.playerScore;

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
          {/* Tappable opponent avatars */}
          <div className="flex -space-x-2">
            {opponentIds.map(id => {
              const p = players.find(pl => pl.id === id);
              if (!p) return null;
              return <TappableAvatar key={id} player={p} />;
            })}
          </div>
          {partnerIds.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-on-surface-variant font-medium">w/</span>
              {partnerIds.map(id => {
                const p = players.find(pl => pl.id === id);
                if (!p) return null;
                return <TappableAvatar key={id} player={p} />;
              })}
            </div>
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