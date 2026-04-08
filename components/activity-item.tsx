'use client';

import type { Game, Player } from '@/types';
import { timeAgo } from '@/lib/utils';

interface ActivityItemProps {
  game: Game;
  userId: string;
  players: Player[];
}

export default function ActivityItem({ game, userId, players }: ActivityItemProps) {
  const isOnPlayerSide = game.playerIds.includes(userId);
  const won = (isOnPlayerSide && game.winner === 'player') || (!isOnPlayerSide && game.winner === 'opponent');

  const opponentIds = isOnPlayerSide ? game.opponentIds : game.playerIds;
  const opponentNames = opponentIds
    .map(id => players.find(p => p.id === id)?.name || 'Unknown')
    .join(' & ');

  const myScore = isOnPlayerSide ? game.playerScore : game.opponentScore;
  const theirScore = isOnPlayerSide ? game.opponentScore : game.playerScore;
  const eloDelta = game.eloChanges[userId] || 0;

  return (
    <div className="bg-surface-container-low p-4 rounded-[1.5rem] flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-pointer">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        won ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-on-surface-variant'
      }`}>
        <span className="material-symbols-outlined" style={won ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {won ? 'check_circle' : 'cancel'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-on-surface truncate">
          {won ? 'Victory' : 'Close Loss'} vs {opponentNames}
        </h3>
        <p className="text-on-surface-variant text-xs font-medium">
          {game.venue ? `${game.venue} \u00b7 ` : ''}{timeAgo(game.date)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`block font-black font-[family-name:var(--font-headline)] text-lg leading-none ${
          won ? 'text-primary' : 'text-on-surface-variant'
        }`}>
          {myScore}-{theirScore}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          won ? 'text-primary' : 'text-on-surface-variant'
        }`}>
          {won ? 'Win' : 'Loss'}
        </span>
      </div>
    </div>
  );
}
