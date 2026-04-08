'use client';

import { usePlayers } from '@/hooks/use-players';
import Podium from '@/components/podium';
import LeaderboardRow from '@/components/leaderboard-row';

export default function LeaguePage() {
  const { players, userId, loading } = usePlayers();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => b.elo - a.elo);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const userRank = sorted.findIndex(p => p.id === userId) + 1;
  const userInTop3 = userRank <= 3;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <span className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-widest text-xs">
          Elite Division
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-[family-name:var(--font-headline)]">
          LEAGUE RANKINGS
        </h1>
      </section>

      {/* Podium */}
      <section className="bg-surface-container-low rounded-[2rem] p-4">
        <Podium players={top3} />
      </section>

      {/* User highlight (if not in top 3) */}
      {!userInTop3 && userId && (
        <section>
          {sorted.map((p, i) => {
            if (p.id !== userId) return null;
            return <LeaderboardRow key={p.id} player={p} rank={i + 1} isUser={true} />;
          })}
        </section>
      )}

      {/* Rest of leaderboard */}
      <section className="space-y-3">
        {rest.map((player, i) => (
          <LeaderboardRow
            key={player.id}
            player={player}
            rank={i + 4}
            isUser={player.id === userId}
          />
        ))}
      </section>
    </div>
  );
}
