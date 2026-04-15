'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayers } from '@/hooks/use-players';
import { useGames } from '@/hooks/use-games';
import { BADGES } from '@/lib/badges';
import { getInitials, getAvatarColour, getEloTier, getWinRate } from '@/lib/utils';
import BadgeCircle from '@/components/badge-circle';
import MatchResultCard from '@/components/match-result-card';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { players, userId, loading: playersLoading } = usePlayers();
  const { games, loading: gamesLoading } = useGames();

  if (playersLoading || gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const player = players.find(p => p.id === id);

  if (!player) {
    return (
      <div className="space-y-4 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-on-surface-variant text-sm font-medium hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
        <div className="bg-surface-container-low p-8 rounded-[2rem] text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">person_off</span>
          <p className="text-on-surface-variant font-medium">Player not found in this league.</p>
        </div>
      </div>
    );
  }

  const isMe = player.id === userId;
  const tier = getEloTier(player.elo);
  const winRate = getWinRate(player);
  const playerGames = games
    .filter(g => g.playerIds.includes(player.id) || g.opponentIds.includes(player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const unlockedBadgeIds = new Set(player.badges);
  const unlockedBadges = BADGES.filter(b => unlockedBadgeIds.has(b.id));
  const lockedBadges = BADGES.filter(b => !unlockedBadgeIds.has(b.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-on-surface-variant text-sm font-medium hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back
      </button>

      {/* Header */}
      <section className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: getAvatarColour(player.name), color: '#d9ffad' }}
        >
          {getInitials(player.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface font-[family-name:var(--font-headline)] truncate">
              {player.name}
            </h1>
            {isMe && (
              <span className="text-[10px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full uppercase tracking-widest">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-black font-[family-name:var(--font-headline)] text-primary">
              {player.elo.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{tier}</span>
            {player.currentStreak >= 3 && (
              <span
                className="material-symbols-outlined text-tertiary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title={`${player.currentStreak}-game win streak`}
              >
                local_fire_department
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-[1.25rem]">
          <span className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest block mb-1">
            Games
          </span>
          <span className="text-2xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface">
            {player.gamesPlayed}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.25rem]">
          <span className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest block mb-1">
            Win Rate
          </span>
          <span className="text-2xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface">
            {winRate}%
          </span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-[1.25rem]">
          <span className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest block mb-1">
            Best Streak
          </span>
          <span className="text-2xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface">
            {player.bestStreak}
          </span>
        </div>
      </section>

      {/* W/L breakdown */}
      <section className="bg-surface-container-low p-4 rounded-[1.5rem] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <span className="text-sm font-bold text-on-surface">{player.wins} <span className="text-on-surface-variant font-medium">wins</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
          <span className="text-sm font-bold text-on-surface">{player.losses} <span className="text-on-surface-variant font-medium">losses</span></span>
        </div>
        {player.recentForm.length > 0 && (
          <div className="flex gap-1">
            {player.recentForm.map((r, i) => (
              <div key={i} className={`w-5 h-1.5 rounded-full ${r === 'W' ? 'bg-primary' : 'bg-error'}`} />
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Badges
          </h2>
          <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">
            {unlockedBadges.length} / {BADGES.length}
          </span>
        </div>

        {unlockedBadges.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-6">
            {unlockedBadges.map(badge => (
              <BadgeCircle key={badge.id} badge={badge} unlocked={true} />
            ))}
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {lockedBadges.map(badge => (
              <BadgeCircle key={badge.id} badge={badge} unlocked={false} />
            ))}
          </div>
        )}
      </section>

      {/* Recent matches */}
      {playerGames.length > 0 && userId && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Recent Matches
          </h2>
          {playerGames.map(game => (
            <MatchResultCard key={game.id} game={game} userId={player.id} players={players} />
          ))}
        </section>
      )}
    </div>
  );
}
