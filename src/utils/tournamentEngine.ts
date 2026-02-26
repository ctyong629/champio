// ============================================
// Tournament Engine - Bracket Generation & Advancement
// ============================================

import type { BracketMatch, BracketData } from '@/types/bracket';

// ============================================
// Single Elimination (單敗淘汰)
// ============================================

export function generateSingleElimination(teams: string[]): BracketData {
  const numTeams = teams.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const bracketSize = Math.pow(2, numRounds);
  
  // Pad with byes if needed
  const paddedTeams = [...teams];
  while (paddedTeams.length < bracketSize) {
    paddedTeams.push(null as unknown as string);
  }

  const matches: BracketMatch[] = [];
  let matchId = 0;

  // Generate rounds from final to first
  for (let r = numRounds; r >= 1; r--) {
    const matchesInRound = Math.pow(2, r - 1);
    
    for (let p = 0; p < matchesInRound; p++) {
      const match: BracketMatch = {
        id: `match-${matchId++}`,
        round: r,
        position: p,
        status: 'pending',
      };

      // Link to next round
      if (r < numRounds) {
        const nextRoundMatchId = Math.floor(p / 2);
        match.nextMatchId = `match-${matchId + matchesInRound - p - 1 + nextRoundMatchId}`;
        match.nextPosition = p % 2 === 0 ? 'A' : 'B';
      }

      // Fill first round with teams
      if (r === 1) {
        const teamIndex = p * 2;
        if (teamIndex < paddedTeams.length && paddedTeams[teamIndex]) {
          match.teamA = { name: paddedTeams[teamIndex] };
        }
        if (teamIndex + 1 < paddedTeams.length && paddedTeams[teamIndex + 1]) {
          match.teamB = { name: paddedTeams[teamIndex + 1] };
        }
      }

      matches.push(match);
    }
  }

  return { type: 'single', rounds: numRounds, matches };
}

// ============================================
// Double Elimination (雙敗淘汰)
// ============================================

export interface DoubleEliminationData {
  winnersBracket: { round: number; name: string; matches: BracketMatch[] }[];
  losersBracket: { round: number; name: string; matches: BracketMatch[] }[];
  grandFinals: BracketMatch[];
}

export function generateDoubleElimination(teams: string[]): DoubleEliminationData {
  const numTeams = teams.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const bracketSize = Math.pow(2, numRounds);
  
  // Pad with byes if needed
  const paddedTeams = [...teams];
  while (paddedTeams.length < bracketSize) {
    paddedTeams.push(null as unknown as string);
  }

  // Generate Winners Bracket
  const winnersBracket: DoubleEliminationData['winnersBracket'] = [];

  for (let round = 1; round <= numRounds; round++) {
    const matches: BracketMatch[] = [];
    const matchesInRound = Math.pow(2, numRounds - round);

    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: `wb-r${round}-m${i + 1}`,
        round,
        position: i,
        status: 'pending',
      };

      // Link to next round
      if (round < numRounds) {
        match.nextMatchId = `wb-r${round + 1}-m${Math.floor(i / 2) + 1}`;
        match.nextPosition = i % 2 === 0 ? 'A' : 'B';
      }

      // Fill first round with teams
      if (round === 1) {
        const teamIndex = i * 2;
        if (teamIndex < paddedTeams.length && paddedTeams[teamIndex]) {
          match.teamA = { name: paddedTeams[teamIndex] };
        }
        if (teamIndex + 1 < paddedTeams.length && paddedTeams[teamIndex + 1]) {
          match.teamB = { name: paddedTeams[teamIndex + 1] };
        }
      }

      matches.push(match);
    }

    winnersBracket.push({
      round,
      name: round === numRounds ? '勝部決賽' : `勝部第 ${round} 輪`,
      matches,
    });
  }

  // Generate Losers Bracket
  const losersBracket: DoubleEliminationData['losersBracket'] = [];
  const numLoserRounds = (numRounds - 1) * 2 + 1;

  for (let round = 1; round <= numLoserRounds; round++) {
    const matches: BracketMatch[] = [];
    let matchesInRound: number;
    
    // Calculate matches for this round
    if (round === 1) {
      matchesInRound = Math.pow(2, numRounds - 2);
    } else if (round % 2 === 0) {
      matchesInRound = Math.pow(2, numRounds - 1 - Math.floor(round / 2));
    } else {
      matchesInRound = Math.pow(2, numRounds - 1 - Math.floor((round - 1) / 2));
    }

    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: `lb-r${round}-m${i + 1}`,
        round,
        position: i,
        status: 'pending',
      };

      // Link to next round in losers bracket
      if (round < numLoserRounds) {
        if (round % 2 === 1) {
          // Odd rounds: winners advance to next round
          match.nextMatchId = `lb-r${round + 1}-m${Math.floor(i / 2) + 1}`;
          match.nextPosition = i % 2 === 0 ? 'A' : 'B';
        } else {
          // Even rounds: winners advance
          match.nextMatchId = `lb-r${round + 1}-m${i + 1}`;
          match.nextPosition = 'A';
        }
      }

      matches.push(match);
    }

    losersBracket.push({
      round,
      name: `敗部第 ${round} 輪`,
      matches,
    });
  }

  // Grand Finals
  const grandFinals: BracketMatch[] = [
    {
      id: 'gf-1',
      round: numRounds + 1,
      position: 0,
      status: 'pending',
    }
  ];

  return {
    winnersBracket,
    losersBracket,
    grandFinals,
  };
}

// ============================================
// Advancement Functions
// ============================================

/**
 * Advance winner to next round
 */
export function advanceWinner(
  match: BracketMatch,
  nextRound: { matches: BracketMatch[] } | undefined,
  position: number
): BracketMatch[] | null {
  if (!nextRound || !match.winner) return null;

  const nextMatch = nextRound.matches[Math.floor((position - 1) / 2)];
  if (!nextMatch) return null;

  const winner = match.winner === 'A' ? match.teamA : match.teamB;
  
  return nextRound.matches.map(m => {
    if (m.id === nextMatch.id) {
      if (position % 2 === 1) {
        return { ...m, teamA: winner };
      } else {
        return { ...m, teamB: winner };
      }
    }
    return m;
  });
}

/**
 * Advance loser to losers bracket
 */
export function advanceLoserToLosers(
  match: BracketMatch,
  losersBracket: { round: number; matches: BracketMatch[] }[],
  round: number
): BracketMatch[] | null {
  const loser = match.winner === 'A' ? match.teamB : match.teamA;
  
  if (!loser) return null;

  // Find the appropriate losers bracket round
  const lbRound = losersBracket.find(r => r.round === round);
  if (!lbRound) return null;

  // Find the next available slot
  const emptyMatch = lbRound.matches.find(m => !m.teamA || !m.teamB);
  if (!emptyMatch) return null;

  return lbRound.matches.map(m => {
    if (m.id === emptyMatch.id) {
      if (!m.teamA) {
        return { ...m, teamA: loser };
      } else {
        return { ...m, teamB: loser };
      }
    }
    return m;
  });
}

// ============================================
// Round Robin (循環賽)
// ============================================

export function generateRoundRobin(teams: string[]): BracketMatch[] {
  const n = teams.length;
  const matches: BracketMatch[] = [];
  let matchId = 1;

  // Circle method for round robin
  const circle = [...teams];
  if (n % 2 === 1) {
    circle.push('BYE');
  }

  const numRounds = circle.length - 1;
  const half = circle.length / 2;

  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const teamA = circle[i];
      const teamB = circle[circle.length - 1 - i];

      if (teamA !== 'BYE' && teamB !== 'BYE') {
        matches.push({
          id: `rr-r${round}-m${matchId}`,
          round,
          position: matchId,
          teamA: { name: teamA },
          teamB: { name: teamB },
          status: 'pending',
        });
        matchId++;
      }
    }

    // Rotate the circle (keep first element fixed)
    const last = circle.pop()!;
    circle.splice(1, 0, last);
  }

  return matches;
}

// ============================================
// Swiss System (瑞士制) - Dynamic Pairing
// ============================================

export interface SwissStanding {
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  buchholz: number; // Tiebreaker
}

export function calculateSwissStandings(matches: BracketMatch[]): SwissStanding[] {
  const standings: Record<string, SwissStanding> = {};

  // Initialize
  matches.forEach(m => {
    if (m.teamA && !standings[m.teamA.name]) {
      standings[m.teamA.name] = {
        teamName: m.teamA.name,
        played: 0, wins: 0, losses: 0,
        pointsFor: 0, pointsAgainst: 0, buchholz: 0,
      };
    }
    if (m.teamB && !standings[m.teamB.name]) {
      standings[m.teamB.name] = {
        teamName: m.teamB.name,
        played: 0, wins: 0, losses: 0,
        pointsFor: 0, pointsAgainst: 0, buchholz: 0,
      };
    }
  });

  // Calculate from completed matches
  matches.forEach(m => {
    if (m.status === 'finished' && m.teamA && m.teamB) {
      const a = standings[m.teamA.name];
      const b = standings[m.teamB.name];

      if (a && b) {
        a.played++;
        b.played++;

        a.pointsFor += m.teamA.score || 0;
        a.pointsAgainst += m.teamB.score || 0;
        b.pointsFor += m.teamB.score || 0;
        b.pointsAgainst += m.teamA.score || 0;

        if ((m.teamA.score || 0) > (m.teamB.score || 0)) {
          a.wins++;
          b.losses++;
        } else {
          a.losses++;
          b.wins++;
        }
      }
    }
  });

  // Calculate Buchholz (sum of opponents' wins)
  Object.values(standings).forEach(s => {
    s.buchholz = matches
      .filter(m => m.teamA?.name === s.teamName || m.teamB?.name === s.teamName)
      .reduce((sum, m) => {
        const opponent = m.teamA?.name === s.teamName ? m.teamB : m.teamA;
        return sum + (opponent ? (standings[opponent.name]?.wins || 0) : 0);
      }, 0);
  });

  // Sort by wins, then Buchholz
  return Object.values(standings).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.buchholz - a.buchholz;
  });
}

/**
 * Generate Swiss pairing based on current standings
 */
export function generateSwissPairing(
  matches: BracketMatch[],
  round: number
): BracketMatch[] {
  const standings = calculateSwissStandings(matches);
  const newMatches: BracketMatch[] = [];

  // Group teams by win count
  const groups: Record<number, string[]> = {};
  standings.forEach(s => {
    if (!groups[s.wins]) groups[s.wins] = [];
    groups[s.wins].push(s.teamName);
  });

  // Sort win counts descending
  const winCounts = Object.keys(groups).map(Number).sort((a, b) => b - a);

  let matchNum = 1;
  const paired = new Set<string>();

  // Pair within each group
  winCounts.forEach(wins => {
    const group = groups[wins].filter(t => !paired.has(t));
    
    // Shuffle to avoid repeated pairings
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }

    // Pair teams
    for (let i = 0; i < group.length - 1; i += 2) {
      const teamA = group[i];
      const teamB = group[i + 1];

      if (teamA && teamB && !paired.has(teamA) && !paired.has(teamB)) {
        newMatches.push({
          id: `swiss-r${round}-m${matchNum++}`,
          round,
          position: matchNum - 1,
          teamA: { name: teamA },
          teamB: { name: teamB },
          status: 'pending',
        });
        paired.add(teamA);
        paired.add(teamB);
      }
    }
  });

  return newMatches;
}
