import { format, formatDistanceToNow, isWithinInterval, subDays } from 'date-fns';
import type { EloTier, Player } from '@/types';
import { ELO_TIERS, LEVEL_TITLES, XP_PER_LEVEL } from './constants';

export function generateId(): string {
  return crypto.randomUUID();
}

export function getEloTier(elo: number): EloTier {
  for (const { min, tier } of ELO_TIERS) {
    if (elo >= min) return tier;
  }
  return 'Rookie';
}

export function getEloTierColour(tier: EloTier): string {
  switch (tier) {
    case 'Pro': return '#96fc00';
    case 'Advanced': return '#3a6700';
    case 'Competitor': return '#535c69';
    case 'Rookie': return '#abaea9';
  }
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy');
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'h:mm a');
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'MMM d, h:mm a');
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function isWithinDays(iso: string, days: number): boolean {
  return isWithinInterval(new Date(iso), {
    start: subDays(new Date(), days),
    end: new Date(),
  });
}

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getLevelTitle(level: number): string {
  const levels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of levels) {
    if (level >= threshold) return LEVEL_TITLES[threshold];
  }
  return 'Fresh Paddle';
}

export function getLevelProgress(xp: number): { current: number; max: number; percent: number } {
  const xpInLevel = xp % XP_PER_LEVEL;
  return {
    current: xpInLevel,
    max: XP_PER_LEVEL,
    percent: (xpInLevel / XP_PER_LEVEL) * 100,
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColour(name: string): string {
  const colours = [
    '#3a6700', '#535c69', '#9c3f00', '#325a00',
    '#47505d', '#893600', '#652600', '#274700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colours[Math.abs(hash) % colours.length];
}

export function getPlayerRank(player: Player, allPlayers: Player[]): number {
  const sorted = [...allPlayers].sort((a, b) => b.elo - a.elo);
  return sorted.findIndex(p => p.id === player.id) + 1;
}

export function getWinRate(player: Player): number {
  if (player.gamesPlayed === 0) return 0;
  return Math.round((player.wins / player.gamesPlayed) * 100);
}

export function getWeeklyEloChange(player: Player): number {
  const weekAgo = subDays(new Date(), 7).toISOString();
  const recentSnapshots = player.eloHistory.filter(s => s.date >= weekAgo);
  if (recentSnapshots.length === 0) return 0;
  const oldest = recentSnapshots[0].elo;
  return player.elo - oldest;
}
