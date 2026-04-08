export interface Player {
  id: string;
  name: string;
  elo: number;
  eloHistory: EloSnapshot[];
  wins: number;
  losses: number;
  currentStreak: number; // positive = win streak, negative = loss streak
  bestStreak: number;
  gamesPlayed: number;
  badges: string[]; // badge IDs
  xp: number;
  level: number;
  recentForm: ('W' | 'L')[]; // last 5 results
  createdAt: string; // ISO date
  isUser: boolean;
}

export interface EloSnapshot {
  date: string;
  elo: number;
  gameId: string;
}

export interface Game {
  id: string;
  date: string;
  type: 'singles' | 'doubles';
  leagueId: string;
  playerIds: string[];
  opponentIds: string[];
  playerScore: number;
  opponentScore: number;
  winner: 'player' | 'opponent';
  eloChanges: Record<string, number>; // playerId -> delta
  venue?: string;
  createdAt: string;
}

export interface League {
  id: string;
  name: string;
  createdAt: string;
  isDefault: boolean;
  memberIds: string[];
}

export interface LeagueMembership {
  leagueId: string;
  playerId: string;
  elo: number;
  eloHistory: EloSnapshot[];
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  gamesPlayed: number;
  xp: number;
  level: number;
  recentForm: ('W' | 'L')[];
  badges: string[];
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeCategory = 'streak' | 'milestone' | 'skill' | 'social';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbol name
  tier: BadgeTier;
  category: BadgeCategory;
  check: (player: Player, games: Game[]) => boolean;
  progress?: (player: Player, games: Game[]) => { current: number; target: number };
}

export type EloTier = 'Rookie' | 'Competitor' | 'Advanced' | 'Pro';

export interface LevelInfo {
  level: number;
  title: string;
  xpForNext: number;
  xpCurrent: number;
}
