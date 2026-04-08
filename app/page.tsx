'use client';

import { usePlayers } from '@/hooks/use-players';
import { useGames } from '@/hooks/use-games';
import EloHero from '@/components/elo-hero';
import StatCard from '@/components/stat-card';
import StreakCard from '@/components/streak-card';
import MatchCountdown from '@/components/match-countdown';
import ActivityItem from '@/components/activity-item';
import Link from 'next/link';
import { getWinRate } from '@/lib/utils';
import { BADGES } from '@/lib/badges';

export default function Dashboard() {
  const { players, currentUser, userId, loading: playersLoading } = usePlayers();
  const { games, getUserGames, loading: gamesLoading } = useGames();

  if (playersLoading || gamesLoading || !currentUser || !userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const userGames = getUserGames(userId);
  const recentGames = userGames.slice(0, 3);
  const winRate = getWinRate(currentUser);
  const totalBadges = BADGES.length;
  const unlockedBadges = currentUser.badges.length;

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome */}
      <section className="flex flex-col gap-1">
        <span className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-widest text-xs">
          Welcome Back, Champ
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-[family-name:var(--font-headline)]">
          {currentUser.name}
        </h1>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <EloHero player={currentUser} allPlayers={players} />
        <StatCard
          label="Match Wins"
          value={currentUser.wins}
          subtitle={`/ ${currentUser.gamesPlayed}`}
          progress={currentUser.gamesPlayed > 0 ? winRate : 0}
        />
        <StreakCard streak={currentUser.currentStreak} />
      </section>

      {/* Upcoming Match (demo) */}
      <section>
        <MatchCountdown />
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            RECENT LOG
          </h2>
          <Link href="/log" className="text-primary font-bold text-xs uppercase tracking-widest">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentGames.length > 0 ? (
            recentGames.map(game => (
              <ActivityItem key={game.id} game={game} userId={userId} players={players} />
            ))
          ) : (
            <div className="bg-surface-container-low p-8 rounded-[1.5rem] text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">sports_tennis</span>
              <p className="text-on-surface-variant font-medium">No games logged yet</p>
              <Link
                href="/log"
                className="mt-4 inline-block bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest"
              >
                Log Your First Game
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Badge Progress */}
      <section>
        <Link href="/awards" className="block bg-surface-container-low p-4 rounded-[1.5rem] hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              Badge Progress
            </span>
            <span className="text-primary font-bold text-xs">{unlockedBadges} / {totalBadges}</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
              style={{ width: `${(unlockedBadges / totalBadges) * 100}%` }}
            />
          </div>
        </Link>
      </section>
    </div>
  );
}
