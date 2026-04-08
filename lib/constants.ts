import type { EloTier } from '@/types';

// ELO
export const STARTING_ELO = 1000;
export const K_FACTOR_NEW = 32; // < 20 games
export const K_FACTOR_ESTABLISHED = 16;
export const NEW_PLAYER_THRESHOLD = 20;

// ELO Tiers
export const ELO_TIERS: { min: number; tier: EloTier }[] = [
  { min: 2000, tier: 'Pro' },
  { min: 1500, tier: 'Advanced' },
  { min: 1000, tier: 'Competitor' },
  { min: 0, tier: 'Rookie' },
];

// XP
export const XP_BASE_GAME = 50;
export const XP_WIN_BONUS = 30;
export const XP_STREAK_BONUS = 15; // per streak game
export const XP_UPSET_BONUS = 50; // beat higher ELO

// Levels
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Fresh Paddle',
  5: 'Court Curious',
  10: 'Rally Ready',
  15: 'Dink Disciple',
  18: 'Court Dominator',
  20: 'Kitchen Commander',
  25: 'Volley Veteran',
  30: 'Smash Specialist',
  35: 'Net Ninja',
  40: 'Paddle Prophet',
  45: 'Pickleball Legend',
  50: 'Hall of Famer',
};

export const XP_PER_LEVEL = 200;

// Storage keys
export const STORAGE_KEYS = {
  PLAYERS: 'paddleup_players',
  GAMES: 'paddleup_games',
  USER_ID: 'paddleup_user_id',
  INITIALIZED: 'paddleup_initialized',
  VERSION: 'paddleup_version',
  LEAGUES: 'paddleup_leagues',
  LEAGUE_MEMBERSHIPS: 'paddleup_league_memberships',
  ACTIVE_LEAGUE: 'paddleup_active_league',
} as const;

// Bump this to force a reseed of sample data
export const DATA_VERSION = 4;

export const DEFAULT_LEAGUE_NAME = 'Elite Division';

// App
export const APP_NAME = 'PaddleUp';
