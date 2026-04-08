import { XP_BASE_GAME, XP_WIN_BONUS, XP_STREAK_BONUS, XP_UPSET_BONUS } from './constants';

export function calculateXpEarned(
  won: boolean,
  currentStreak: number,
  playerElo: number,
  opponentElo: number
): number {
  let xp = XP_BASE_GAME;

  if (won) {
    xp += XP_WIN_BONUS;

    // Streak bonus
    if (currentStreak > 1) {
      xp += XP_STREAK_BONUS * Math.min(currentStreak, 10);
    }

    // Upset bonus: beat someone 200+ ELO above
    if (opponentElo - playerElo >= 200) {
      xp += XP_UPSET_BONUS;
    }
  }

  return xp;
}
