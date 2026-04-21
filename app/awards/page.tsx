'use client';

import { usePlayers } from '@/hooks/use-players';
import { useGames } from '@/hooks/use-games';
import { BADGES } from '@/lib/badges';
import { getLevel, getLevelTitle, getLevelProgress } from '@/lib/utils';
import BadgeCircle from '@/components/badge-circle';
import BadgeProgress from '@/components/badge-progress';

export default function AwardsPage() {
  const { currentUser, players, loading: playersLoading } = usePlayers();
  const { games, loading: gamesLoading } = useGames();

  if (playersLoading || gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const displayUser = currentUser ?? players[0] ?? null;

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const level = getLevel(displayUser.xp);
  const title = getLevelTitle(level);
  const progress = getLevelProgress(displayUser.xp);
  const nextTitle = getLevelTitle(level + 1);

  const unlockedBadgeIds = new Set(displayUser.badges);
  const unlockedBadges = BADGES.filter(b => unlockedBadgeIds.has(b.id));
  const lockedBadges = BADGES.filter(b => !unlockedBadgeIds.has(b.id));

  // Find next target badge (first locked badge with progress)
  const targetBadge = lockedBadges.find(b => b.progress);

  return (
    <div className="space-y-8 pb-8">
      {/* Level Header */}
      <section>
        <span className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-widest text-xs block mb-1">
          Season 01
        </span>
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-[family-name:var(--font-headline)]">
            {title}
          </h1>
          <span className="text-xl font-bold text-on-surface-variant">
            {displayUser.xp.toLocaleString()} <span className="text-sm">XP</span>
          </span>
        </div>

        <div className="mt-4 bg-surface-container-lowest p-4 rounded-[1.5rem]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-on-surface-variant">Level {level}</span>
            <span className="text-xs font-medium text-on-surface-variant">Next: {nextTitle}</span>
          </div>
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">
            Win {Math.ceil((progress.max - progress.current) / 80)} more matches to reach <span className="font-bold text-primary">{nextTitle}</span>.
          </p>
        </div>
      </section>

      {/* Current Target */}
      {targetBadge && (
        <section>
          <span className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-widest text-xs block mb-3 text-center">
            Current Target
          </span>
          <div className="bg-surface-container-low p-6 rounded-[2rem] text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">{targetBadge.icon}</span>
            </div>
            <h3 className="text-xl font-extrabold font-[family-name:var(--font-headline)] text-on-surface mb-2">
              The {targetBadge.name}
            </h3>
            <p className="text-on-surface-variant text-sm font-medium mb-4">{targetBadge.description}.</p>
            {targetBadge.progress && (() => {
              const p = targetBadge.progress!(displayUser, games);
              return (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Progress</span>
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(p.current / p.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant">{p.current} / {p.target}</span>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Badge Gallery */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Badge Gallery
          </h2>
          <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">
            {unlockedBadges.length} / {BADGES.length} UNLOCKED
          </span>
        </div>

        {/* Unlocked */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {unlockedBadges.map(badge => (
            <BadgeCircle key={badge.id} badge={badge} unlocked={true} />
          ))}
        </div>

        {/* Locked */}
        <div className="grid grid-cols-3 gap-6">
          {lockedBadges.map(badge => (
            <BadgeCircle key={badge.id} badge={badge} unlocked={false} />
          ))}
        </div>
      </section>

      {/* Progress Badges */}
      {lockedBadges.filter(b => b.progress).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            In Progress
          </h2>
          {lockedBadges
            .filter(b => b.progress)
            .map(badge => (
              <BadgeProgress key={badge.id} badge={badge} player={displayUser} games={games} />
            ))}
        </section>
      )}
    </div>
  );
}
