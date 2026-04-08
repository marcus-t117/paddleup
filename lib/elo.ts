import { K_FACTOR_ESTABLISHED, K_FACTOR_NEW, NEW_PLAYER_THRESHOLD } from './constants';

function getKFactor(gamesPlayed: number): number {
  return gamesPlayed < NEW_PLAYER_THRESHOLD ? K_FACTOR_NEW : K_FACTOR_ESTABLISHED;
}

function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  won: boolean,
  gamesPlayed: number
): number {
  const K = getKFactor(gamesPlayed);
  const expected = expectedScore(playerElo, opponentElo);
  const score = won ? 1 : 0;
  return Math.round(K * (score - expected));
}

/**
 * Calculate ELO changes for a doubles match.
 * Uses average team ELO for the expected calculation,
 * but applies individual K-factors per player.
 */
export function calculateDoublesEloChanges(
  team1: { elo: number; gamesPlayed: number }[],
  team2: { elo: number; gamesPlayed: number }[],
  team1Won: boolean
): { team1Deltas: number[]; team2Deltas: number[] } {
  const avgElo1 = team1.reduce((sum, p) => sum + p.elo, 0) / team1.length;
  const avgElo2 = team2.reduce((sum, p) => sum + p.elo, 0) / team2.length;

  const team1Deltas = team1.map(p => {
    const K = getKFactor(p.gamesPlayed);
    const expected = expectedScore(avgElo1, avgElo2);
    const score = team1Won ? 1 : 0;
    return Math.round(K * (score - expected));
  });

  const team2Deltas = team2.map(p => {
    const K = getKFactor(p.gamesPlayed);
    const expected = expectedScore(avgElo2, avgElo1);
    const score = team1Won ? 0 : 1;
    return Math.round(K * (score - expected));
  });

  return { team1Deltas, team2Deltas };
}
