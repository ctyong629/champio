// ============================================
// Tournament Formats - Round Robin, Swiss, etc.
// ============================================

// Tournament format utilities

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'groups';

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  teamA: string | null;
  teamB: string | null;
  scoreA?: number;
  scoreB?: number;
  winner?: string | null;
  court?: string;
  scheduledTime?: string;
  status: 'pending' | 'live' | 'completed';
}

export interface TournamentBracket {
  format: TournamentFormat;
  rounds: {
    round: number;
    name: string;
    matches: Match[];
  }[];
  standings?: TeamStanding[];
}

export interface TeamStanding {
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  draws?: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
}

// ============================================
// Single Elimination (單敗淘汰)
// ============================================

export function generateSingleElimination(teams: string[]): TournamentBracket {
  const numTeams = teams.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const bracketSize = Math.pow(2, numRounds);
  
  // Pad with byes if needed
  const paddedTeams = [...teams];
  while (paddedTeams.length < bracketSize) {
    paddedTeams.push(null as unknown as string);
  }

  const rounds: TournamentBracket['rounds'] = [];
  let currentRoundTeams = [...paddedTeams];

  for (let round = 1; round <= numRounds; round++) {
    const matches: Match[] = [];
    const matchesInRound = currentRoundTeams.length / 2;

    for (let i = 0; i < matchesInRound; i++) {
      const teamA = currentRoundTeams[i * 2];
      const teamB = currentRoundTeams[i * 2 + 1];
      
      matches.push({
        id: `r${round}-m${i + 1}`,
        round,
        matchNumber: i + 1,
        teamA: teamA || null,
        teamB: teamB || null,
        status: 'pending',
      });
    }

    rounds.push({
      round,
      name: round === numRounds ? '決賽' : round === numRounds - 1 ? '準決賽' : `第 ${round} 輪`,
      matches,
    });

    // Next round will have half the teams
    currentRoundTeams = new Array(matchesInRound).fill(null);
  }

  return {
    format: 'single_elimination',
    rounds,
  };
}

// ============================================
// Round Robin (循環賽)
// ============================================

export function generateRoundRobin(teams: string[]): TournamentBracket {
  const n = teams.length;
  const matches: Match[] = [];
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
          matchNumber: matchId,
          teamA,
          teamB,
          status: 'pending',
        });
        matchId++;
      }
    }

    // Rotate the circle (keep first element fixed)
    const last = circle.pop()!;
    circle.splice(1, 0, last);
  }

  return {
    format: 'round_robin',
    rounds: [{
      round: 1,
      name: '循環賽',
      matches,
    }],
  };
}

/**
 * Calculate round robin standings
 */
export function calculateRoundRobinStandings(
  matches: Match[],
  teams: string[]
): TeamStanding[] {
  const standings: Record<string, TeamStanding> = {};

  // Initialize standings
  teams.forEach(team => {
    standings[team] = {
      teamName: team,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      rank: 0,
    };
  });

  // Calculate from completed matches
  matches.forEach(match => {
    if (match.status === 'completed' && match.teamA && match.teamB) {
      const teamA = standings[match.teamA];
      const teamB = standings[match.teamB];

      if (teamA && teamB) {
        teamA.played++;
        teamB.played++;

        teamA.pointsFor += match.scoreA || 0;
        teamA.pointsAgainst += match.scoreB || 0;
        teamB.pointsFor += match.scoreB || 0;
        teamB.pointsAgainst += match.scoreA || 0;

        if ((match.scoreA || 0) > (match.scoreB || 0)) {
          teamA.wins++;
          teamB.losses++;
        } else if ((match.scoreA || 0) < (match.scoreB || 0)) {
          teamA.losses++;
          teamB.wins++;
        } else {
          teamA.draws = (teamA.draws || 0) + 1;
          teamB.draws = (teamB.draws || 0) + 1;
        }
      }
    }
  });

  // Calculate point differential and sort
  const sorted = Object.values(standings).map(s => ({
    ...s,
    pointDiff: s.pointsFor - s.pointsAgainst,
  })).sort((a, b) => {
    // Sort by wins first, then point differential
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointDiff - a.pointDiff;
  });

  // Assign ranks
  sorted.forEach((team, index) => {
    team.rank = index + 1;
  });

  return sorted;
}

// ============================================
// Swiss System (瑞士制)
// ============================================

export interface SwissRound {
  round: number;
  matches: Match[];
  standings: TeamStanding[];
}

export function generateSwissSystem(
  teams: string[],
  numRounds: number
): TournamentBracket {
  const matches: Match[] = [];
  let matchId = 1;

  // Initial random pairing for round 1
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  for (let round = 1; round <= numRounds; round++) {
    const roundMatches: Match[] = [];

    if (round === 1) {
      // Random pairing for first round
      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          roundMatches.push({
            id: `swiss-r${round}-m${matchId}`,
            round,
            matchNumber: matchId,
            teamA: shuffled[i],
            teamB: shuffled[i + 1],
            status: 'pending',
          });
          matchId++;
        }
      }
    } else {
      // Subsequent rounds: pair teams with similar records
      // This is simplified - real Swiss would use standings
      const remaining = [...shuffled];
      while (remaining.length >= 2) {
        const teamA = remaining.shift()!;
        const teamB = remaining.shift()!;
        
        roundMatches.push({
          id: `swiss-r${round}-m${matchId}`,
          round,
          matchNumber: matchId,
          teamA,
          teamB,
          status: 'pending',
        });
        matchId++;
      }
    }

    matches.push(...roundMatches);
  }

  return {
    format: 'swiss',
    rounds: Array.from({ length: numRounds }, (_, i) => ({
      round: i + 1,
      name: `第 ${i + 1} 輪`,
      matches: matches.filter(m => m.round === i + 1),
    })),
  };
}

// ============================================
// Groups + Knockout (分組淘汰)
// ============================================

export function generateGroupsWithKnockout(
  teams: string[],
  numGroups: number,
  teamsPerGroupAdvance: number
): TournamentBracket {
  const teamsPerGroup = Math.ceil(teams.length / numGroups);
  const groups: string[][] = [];

  // Split teams into groups
  for (let i = 0; i < numGroups; i++) {
    const start = i * teamsPerGroup;
    const end = start + teamsPerGroup;
    groups.push(teams.slice(start, end));
  }

  const rounds: TournamentBracket['rounds'] = [];

  // Group stage (round robin within each group)
  const groupMatches: Match[] = [];

  groups.forEach((group, groupIndex) => {
    const groupBracket = generateRoundRobin(group);
    groupMatches.push(...groupBracket.rounds[0].matches.map(m => ({
      ...m,
      id: `g${groupIndex + 1}-${m.id}`,
    })));
  });

  rounds.push({
    round: 1,
    name: '分組賽',
    matches: groupMatches,
  });

  // Knockout stage (top teams from each group)
  const advancingTeams = numGroups * teamsPerGroupAdvance;
  const knockout = generateSingleElimination(
    new Array(advancingTeams).fill(null).map((_, i) => `晉級隊伍 ${i + 1}`)
  );

  knockout.rounds.forEach((round, index) => {
    rounds.push({
      round: index + 2,
      name: round.name,
      matches: round.matches.map(m => ({
        ...m,
        id: `ko-${m.id}`,
      })),
    });
  });

  return {
    format: 'groups',
    rounds,
  };
}

// ============================================
// Double Elimination (雙敗淘汰賽)
// ============================================

export interface DoubleEliminationBracket {
  winnersBracket: TournamentBracket['rounds'];
  losersBracket: TournamentBracket['rounds'];
  grandFinals: Match[];
}

export function generateDoubleElimination(teams: string[]): DoubleEliminationBracket {
  const numTeams = teams.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const bracketSize = Math.pow(2, numRounds);
  
  // Pad with byes if needed
  const paddedTeams = [...teams];
  while (paddedTeams.length < bracketSize) {
    paddedTeams.push(null as unknown as string);
  }

  // Generate Winners Bracket (same as single elimination)
  const winnersBracket: TournamentBracket['rounds'] = [];
  let currentRoundTeams = [...paddedTeams];

  for (let round = 1; round <= numRounds; round++) {
    const matches: Match[] = [];
    const matchesInRound = currentRoundTeams.length / 2;

    for (let i = 0; i < matchesInRound; i++) {
      const teamA = currentRoundTeams[i * 2];
      const teamB = currentRoundTeams[i * 2 + 1];
      
      matches.push({
        id: `wb-r${round}-m${i + 1}`,
        round,
        matchNumber: i + 1,
        teamA: teamA || null,
        teamB: teamB || null,
        status: 'pending',
      });
    }

    winnersBracket.push({
      round,
      name: round === numRounds ? '勝部決賽' : `勝部第 ${round} 輪`,
      matches,
    });

    currentRoundTeams = new Array(matchesInRound).fill(null);
  }

  // Generate Losers Bracket
  const losersBracket: TournamentBracket['rounds'] = [];
  const numLoserRounds = (numRounds - 1) * 2 + 1;

  for (let round = 1; round <= numLoserRounds; round++) {
    const matches: Match[] = [];
    // Losers bracket has varying number of matches per round
    let matchesInRound: number;
    
    if (round === 1) {
      matchesInRound = Math.pow(2, numRounds - 2);
    } else if (round % 2 === 0) {
      matchesInRound = Math.pow(2, numRounds - 1 - Math.floor(round / 2));
    } else {
      matchesInRound = Math.pow(2, numRounds - 1 - Math.floor((round - 1) / 2));
    }

    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `lb-r${round}-m${i + 1}`,
        round,
        matchNumber: i + 1,
        teamA: null,
        teamB: null,
        status: 'pending',
      });
    }

    losersBracket.push({
      round,
      name: `敗部第 ${round} 輪`,
      matches,
    });
  }

  // Grand Finals (if needed - bracket reset)
  const grandFinals: Match[] = [{
    id: 'gf-1',
    round: numRounds + 1,
    matchNumber: 1,
    teamA: null, // Winners bracket champion
    teamB: null, // Losers bracket champion
    status: 'pending',
  }];

  return {
    winnersBracket,
    losersBracket,
    grandFinals,
  };
}

/**
 * Advance loser from winners bracket to losers bracket
 */
export function advanceLoserToLosers(
  match: Match,
  losersBracket: TournamentBracket['rounds'],
  round: number
): void {
  // Find the appropriate losers bracket match
  const loserTeam = match.winner === match.teamA ? match.teamB : match.teamA;
  
  if (!loserTeam) return;

  // Find the next available slot in losers bracket
  const lbRound = losersBracket.find(r => r.round === round);
  if (lbRound) {
    const emptyMatch = lbRound.matches.find(m => !m.teamA || !m.teamB);
    if (emptyMatch) {
      if (!emptyMatch.teamA) {
        emptyMatch.teamA = loserTeam;
      } else {
        emptyMatch.teamB = loserTeam;
      }
    }
  }
}

/**
 * Advance winner to next round
 */
export function advanceWinner(
  match: Match,
  nextRound: TournamentBracket['rounds'][0] | undefined,
  position: number
): void {
  if (!nextRound || !match.winner) return;

  const nextMatch = nextRound.matches[Math.floor((position - 1) / 2)];
  if (nextMatch) {
    if (position % 2 === 1) {
      nextMatch.teamA = match.winner;
    } else {
      nextMatch.teamB = match.winner;
    }
  }
}

// ============================================
// Format Labels
// ============================================

export const formatLabels: Record<TournamentFormat, { name: string; description: string }> = {
  single_elimination: {
    name: '單敗淘汰賽',
    description: '輸一場即淘汰，適合時間有限的賽事',
  },
  double_elimination: {
    name: '雙敗淘汰賽',
    description: '輸兩場才淘汰，給予隊伍第二次機會',
  },
  round_robin: {
    name: '循環賽',
    description: '每隊互相對戰，積分最高者獲勝',
  },
  swiss: {
    name: '瑞士制',
    description: '根據戰績配對，適合大量隊伍',
  },
  groups: {
    name: '分組淘汰賽',
    description: '先分組循環，再進行淘汰賽',
  },
};

// ============================================
// Bracket Visualization Helpers
// ============================================

export function getBracketDepth(teams: number): number {
  return Math.ceil(Math.log2(teams));
}

export function getTotalMatches(format: TournamentFormat, teams: number): number {
  switch (format) {
    case 'single_elimination':
      return teams - 1;
    case 'double_elimination':
      return (teams - 1) * 2;
    case 'round_robin':
      return (teams * (teams - 1)) / 2;
    case 'swiss':
      return teams * Math.ceil(Math.log2(teams));
    default:
      return teams - 1;
  }
}
