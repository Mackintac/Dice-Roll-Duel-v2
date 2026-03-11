const K = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(
  winnerRating: number,
  loserRating: number,
): { newWinner: number; newLoser: number; delta: number } {
  const expected = expectedScore(winnerRating, loserRating);
  const delta = Math.round(K * (1 - expected));
  return {
    newWinner: winnerRating + delta,
    newLoser: loserRating - delta,
    delta,
  };
}
