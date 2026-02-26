// ============================================
// Bracket Types
// ============================================

export type BracketType = 'single' | 'double' | 'roundrobin';

export interface BracketTeam {
  name: string;
  score?: number;
  isWinner?: boolean;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  teamA?: BracketTeam;
  teamB?: BracketTeam;
  winner?: 'A' | 'B';
  status: 'pending' | 'live' | 'finished';
  court?: string;
  startTime?: string;
  nextMatchId?: string;
  nextPosition?: 'A' | 'B';
}

export interface BracketData {
  type: BracketType;
  rounds: number;
  matches: BracketMatch[];
  winnersBracket?: { round: number; name: string; matches: BracketMatch[] }[];
  losersBracket?: { round: number; name: string; matches: BracketMatch[] }[];
  grandFinals?: BracketMatch[];
}
