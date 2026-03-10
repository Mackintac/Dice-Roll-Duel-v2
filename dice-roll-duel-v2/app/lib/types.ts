export interface Player {
  id: string;
  name: string;
  elo: number;
  rank: number;
  wins: number;
  losses: number;
  createdAt: string;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  rounds: Round[];
  winnerId: string;
  eloChange: number;
  playedAt: string;
}

export interface Round {
  roll1: number; // player1 roll
  roll2: number; // player2 roll
  winnderId: string | null; // winner's id, null means they tied
}
