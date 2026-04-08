import type { BadgeDefinition, Player, Game } from '@/types';

function getPlayerGames(player: Player, games: Game[]): Game[] {
  return games.filter(
    g => g.playerIds.includes(player.id) || g.opponentIds.includes(player.id)
  );
}

function didPlayerWin(player: Player, game: Game): boolean {
  const isOnPlayerSide = game.playerIds.includes(player.id);
  return (isOnPlayerSide && game.winner === 'player') ||
         (!isOnPlayerSide && game.winner === 'opponent');
}

function getDoublesGames(player: Player, games: Game[]): Game[] {
  return getPlayerGames(player, games).filter(g => g.type === 'doubles');
}

function getUniquePartners(player: Player, games: Game[]): Set<string> {
  const partners = new Set<string>();
  for (const game of getDoublesGames(player, games)) {
    const team = game.playerIds.includes(player.id) ? game.playerIds : game.opponentIds;
    for (const id of team) {
      if (id !== player.id) partners.add(id);
    }
  }
  return partners;
}

function winsInLastDays(player: Player, games: Game[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  return getPlayerGames(player, games).filter(
    g => g.date >= cutoffStr && didPlayerWin(player, g)
  ).length;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'flash-serve',
    name: 'Flash Serve',
    description: 'Win your first game',
    icon: 'bolt',
    tier: 'bronze',
    category: 'milestone',
    check: (p) => p.wins >= 1,
    progress: (p) => ({ current: Math.min(p.wins, 1), target: 1 }),
  },
  {
    id: 'hot-streak',
    name: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: 'local_fire_department',
    tier: 'bronze',
    category: 'streak',
    check: (p) => p.bestStreak >= 3,
    progress: (p) => ({ current: Math.min(p.currentStreak > 0 ? p.currentStreak : 0, 3), target: 3 }),
  },
  {
    id: 'inferno',
    name: 'Inferno',
    description: 'Win 5 games in a row',
    icon: 'whatshot',
    tier: 'silver',
    category: 'streak',
    check: (p) => p.bestStreak >= 5,
    progress: (p) => ({ current: Math.min(p.currentStreak > 0 ? p.currentStreak : 0, 5), target: 5 }),
  },
  {
    id: 'season-vet',
    name: 'Season Vet',
    description: 'Play 20 games',
    icon: 'military_tech',
    tier: 'silver',
    category: 'milestone',
    check: (p) => p.gamesPlayed >= 20,
    progress: (p) => ({ current: Math.min(p.gamesPlayed, 20), target: 20 }),
  },
  {
    id: 'dink-king',
    name: 'Dink King',
    description: 'Win 10 close games (11-9 or 11-10)',
    icon: 'precision_manufacturing',
    tier: 'gold',
    category: 'skill',
    check: (p, games) => {
      const closeWins = getPlayerGames(p, games).filter(g => {
        const won = didPlayerWin(p, g);
        const winnerScore = Math.max(g.playerScore, g.opponentScore);
        const loserScore = Math.min(g.playerScore, g.opponentScore);
        return won && winnerScore === 11 && loserScore >= 9;
      });
      return closeWins.length >= 10;
    },
    progress: (p, games) => {
      const closeWins = getPlayerGames(p, games).filter(g => {
        const won = didPlayerWin(p, g);
        const winnerScore = Math.max(g.playerScore, g.opponentScore);
        const loserScore = Math.min(g.playerScore, g.opponentScore);
        return won && winnerScore === 11 && loserScore >= 9;
      });
      return { current: Math.min(closeWins.length, 10), target: 10 };
    },
  },
  {
    id: 'iron-defence',
    name: 'Iron Defence',
    description: 'Win 5 games where opponent scores under 5',
    icon: 'shield',
    tier: 'gold',
    category: 'skill',
    check: (p, games) => {
      const dominantWins = getPlayerGames(p, games).filter(g => {
        const won = didPlayerWin(p, g);
        const isOnPlayerSide = g.playerIds.includes(p.id);
        const oppScore = isOnPlayerSide ? g.opponentScore : g.playerScore;
        return won && oppScore < 5;
      });
      return dominantWins.length >= 5;
    },
    progress: (p, games) => {
      const dominantWins = getPlayerGames(p, games).filter(g => {
        const won = didPlayerWin(p, g);
        const isOnPlayerSide = g.playerIds.includes(p.id);
        const oppScore = isOnPlayerSide ? g.opponentScore : g.playerScore;
        return won && oppScore < 5;
      });
      return { current: Math.min(dominantWins.length, 5), target: 5 };
    },
  },
  {
    id: 'atp-master',
    name: 'ATP Master',
    description: 'Reach Advanced tier (1500 ELO)',
    icon: 'workspace_premium',
    tier: 'gold',
    category: 'milestone',
    check: (p) => p.elo >= 1500,
    progress: (p) => ({ current: Math.min(p.elo, 1500), target: 1500 }),
  },
  {
    id: 'giant-killer',
    name: 'Giant Killer',
    description: 'Beat a player 200+ ELO above you',
    icon: 'swords',
    tier: 'gold',
    category: 'skill',
    check: (p, games) => {
      return getPlayerGames(p, games).some(g => {
        if (!didPlayerWin(p, g)) return false;
        const change = g.eloChanges[p.id] || 0;
        // If change is significantly higher than average, it was an upset
        return change >= 25;
      });
    },
  },
  {
    id: 'community-legend',
    name: 'Community Legend',
    description: 'Play with 10 different partners',
    icon: 'groups',
    tier: 'platinum',
    category: 'social',
    check: (p, games) => getUniquePartners(p, games).size >= 10,
    progress: (p, games) => ({
      current: Math.min(getUniquePartners(p, games).size, 10),
      target: 10,
    }),
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Play 100 games',
    icon: 'emoji_events',
    tier: 'platinum',
    category: 'milestone',
    check: (p) => p.gamesPlayed >= 100,
    progress: (p) => ({ current: Math.min(p.gamesPlayed, 100), target: 100 }),
  },
  {
    id: 'court-dominator',
    name: 'Court Dominator',
    description: 'Reach Pro tier (2000 ELO)',
    icon: 'diamond',
    tier: 'platinum',
    category: 'milestone',
    check: (p) => p.elo >= 2000,
    progress: (p) => ({ current: Math.min(p.elo, 2000), target: 2000 }),
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Win 5 games in 7 days',
    icon: 'calendar_month',
    tier: 'silver',
    category: 'streak',
    check: (p, games) => winsInLastDays(p, games, 7) >= 5,
    progress: (p, games) => ({
      current: Math.min(winsInLastDays(p, games, 7), 5),
      target: 5,
    }),
  },
];

export function checkBadges(player: Player, games: Game[]): string[] {
  return BADGES
    .filter(badge => !player.badges.includes(badge.id) && badge.check(player, games))
    .map(badge => badge.id);
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find(b => b.id === id);
}

export function getBadgeTierColour(tier: BadgeDefinition['tier']): string {
  switch (tier) {
    case 'bronze': return '#9c3f00';
    case 'silver': return '#535c69';
    case 'gold': return '#3a6700';
    case 'platinum': return '#96fc00';
  }
}
