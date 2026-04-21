'use client';

import { useState, useCallback } from 'react';
import { usePlayers } from '@/hooks/use-players';
import { useGames } from '@/hooks/use-games';
import LogGameModal, { type LogGameData } from '@/components/log-game-modal';
import MatchResultCard from '@/components/match-result-card';
import BadgeUnlockCard from '@/components/badge-unlock-card';
import { getWinRate } from '@/lib/utils';
import { useLeague } from '@/contexts/league-context';
import { SHARED_LEAGUES } from '@/lib/constants';
import { pushShared } from '@/lib/sync';

export default function LogPage() {
  const { players, currentUser, userId, loading: playersLoading, getOrCreatePlayer, refreshPlayers } = usePlayers();
  const { games, logGame, deleteGame, getUserGames, loading: gamesLoading, refreshGames } = useGames();
  const { activeLeague } = useLeague();
  const [showModal, setShowModal] = useState(false);
  const [lastResult, setLastResult] = useState<{ eloDelta: number; newBadges: string[] } | null>(null);

  const handleLogGame = useCallback(async (data: LogGameData) => {
    if (!userId || !activeLeague) return;

    const result = logGame(
      {
        type: data.type,
        opponentName: data.opponentName,
        opponent2Name: data.opponent2Name,
        partnerName: data.partnerName,
        playerScore: data.playerScore,
        opponentScore: data.opponentScore,
        venue: data.venue,
      },
      userId,
      getOrCreatePlayer
    );

    setLastResult({ eloDelta: result.eloDelta, newBadges: result.newBadges });
    setShowModal(false);
    refreshPlayers();
    refreshGames();

    // Push to Redis immediately for shared leagues (don't wait for debounced scheduleSync)
    if (SHARED_LEAGUES.some(l => l.id === activeLeague.id)) {
      pushShared(activeLeague.id);
    }

    // Clear result after 5 seconds
    setTimeout(() => setLastResult(null), 5000);
  }, [userId, activeLeague, logGame, getOrCreatePlayer, refreshPlayers, refreshGames]);

  if (playersLoading || gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const displayUser = currentUser ?? players[0] ?? null;
  const displayUserId = displayUser?.id ?? null;
  const isDemo = !currentUser;

  if (!displayUser || !displayUserId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const userGames = getUserGames(displayUserId);
  const winRate = getWinRate(displayUser);

  return (
    <div className="space-y-6 pb-8">
      {/* Hero CTA */}
      <section>
        <div className="bg-gradient-to-br from-primary to-primary-dim rounded-[2rem] p-8 relative overflow-hidden">
          <span className="text-on-primary/60 text-xs font-bold uppercase tracking-widest block mb-2">
            Ready for action?
          </span>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-headline)] text-on-primary tracking-tight mb-2">
            DOMINATE THE COURT.
          </h1>
          {activeLeague && (
            <span className="inline-block bg-on-primary/10 text-on-primary/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              Logging to: {activeLeague.name}
            </span>
          )}
          {!isDemo && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-fixed text-on-primary-fixed px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Log New Match
            </button>
          )}
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-4 w-16 h-16 border-4 border-primary-container/20 rounded-full" />
        </div>
      </section>

      {/* ELO Change Alert */}
      {lastResult && (
        <section className="space-y-3">
          <div className={`p-4 rounded-[1.5rem] text-center font-bold ${
            lastResult.eloDelta >= 0
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            <span className="text-2xl font-black font-[family-name:var(--font-headline)]">
              {lastResult.eloDelta >= 0 ? '+' : ''}{lastResult.eloDelta} ELO
            </span>
          </div>
          {lastResult.newBadges.map(badgeId => (
            <BadgeUnlockCard key={badgeId} badgeId={badgeId} />
          ))}
        </section>
      )}

      {/* Stats Row */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem]">
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest block mb-2">
            Season Win Rate
          </span>
          <span className="text-4xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface">
            {winRate}%
          </span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] relative overflow-hidden">
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest block mb-2">
            Active Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface">
              {Math.abs(displayUser.currentStreak)}
            </span>
            {displayUser.currentStreak > 0 && (
              <span className="material-symbols-outlined text-tertiary text-2xl icon-filled">
                local_fire_department
              </span>
            )}
          </div>
          {/* Decorative arc */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 border-4 border-primary-container/30 rounded-full" />
        </div>
      </section>

      {/* Match Log */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            MATCH LOG
          </h2>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
            Last 30 Days
          </span>
        </div>
        <div className="space-y-3">
          {userGames.length > 0 ? (
            userGames.map(game => (
              <MatchResultCard
                key={game.id}
                game={game}
                userId={displayUserId}
                players={players}
                onDelete={isDemo ? undefined : (gameId) => { deleteGame(gameId); refreshPlayers(); refreshGames(); }}
              />
            ))
          ) : (
            <div className="bg-surface-container-low p-8 rounded-[1.5rem] text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">sports_tennis</span>
              <p className="text-on-surface-variant font-medium">No matches logged yet. Hit that button!</p>
            </div>
          )}
        </div>
      </section>

      {/* Log Game Modal */}
      <LogGameModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleLogGame}
        players={players}
      />
    </div>
  );
}
