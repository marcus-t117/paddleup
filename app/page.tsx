'use client';

import { useState } from 'react';
import { usePlayers } from '@/hooks/use-players';
import { useGames } from '@/hooks/use-games';
import EloHero from '@/components/elo-hero';
import EloChart from '@/components/elo-chart';
import StatCard from '@/components/stat-card';
import StreakCard from '@/components/streak-card';
import MatchCountdown from '@/components/match-countdown';
import ActivityItem from '@/components/activity-item';
import Link from 'next/link';
import { getWinRate } from '@/lib/utils';
import { BADGES } from '@/lib/badges';
import { getBadgeStyle } from '@/components/badge-circle';
import LeagueSwitcher from '@/components/league-switcher';
import { useLeague } from '@/contexts/league-context';

export default function Dashboard() {
  const { players, currentUser, userId, loading: playersLoading } = usePlayers();
  const [showEloChart, setShowEloChart] = useState(false);
  const { games, getUserGames, loading: gamesLoading } = useGames();
  const { loading: leagueLoading } = useLeague();

  if (playersLoading || gamesLoading || leagueLoading || !currentUser || !userId) {
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
      {/* League Switcher */}
      <section>
        <LeagueSwitcher />
      </section>

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
        <div className="col-span-2 cursor-pointer" onClick={() => setShowEloChart(true)}>
          <EloHero player={currentUser} allPlayers={players} />
        </div>
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

      {/* Next Badge Tracker */}
      {(() => {
        const lockedWithProgress = BADGES
          .filter(b => !currentUser.badges.includes(b.id) && b.progress)
          .map(b => {
            const p = b.progress!(currentUser, games);
            return { badge: b, current: p.current, target: p.target, percent: (p.current / p.target) * 100 };
          })
          .filter(b => b.percent > 0)
          .sort((a, b) => b.percent - a.percent);
        const next = lockedWithProgress[0];
        if (!next) return null;
        return (
          <section>
            <Link href="/awards" className="block bg-surface-container-lowest p-5 rounded-[1.5rem] hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4">
                {(() => {
                  const style = getBadgeStyle(next.badge.id);
                  return (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 relative"
                      style={{
                        padding: '2px',
                        background: style.ring,
                        boxShadow: `0 0 ${Math.round(next.percent / 5) + 8}px ${style.glow}, 0 0 ${Math.round(next.percent / 3) + 12}px ${style.glow}`,
                        opacity: 0.4 + (next.percent / 100) * 0.6,
                        transition: 'all 0.7s',
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                        style={{ background: style.bg }}
                      >
                        <span
                          className="material-symbols-outlined text-2xl"
                          style={{
                            fontVariationSettings: "'FILL' 1, 'wght' 500",
                            color: style.iconColor,
                          }}
                        >
                          {next.badge.icon}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Next Badge</span>
                    <span className="text-xs font-bold text-on-surface-variant">{next.current}/{next.target}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-sm truncate">{next.badge.name}</h3>
                  <div className="mt-2 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(next.percent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        );
      })()}

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

      {/* ELO Chart Modal */}
      {showEloChart && currentUser.eloHistory.length >= 2 && (
        <EloChart history={currentUser.eloHistory} onClose={() => setShowEloChart(false)} />
      )}
    </div>
  );
}
