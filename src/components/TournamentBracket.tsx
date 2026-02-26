import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Maximize2, Download, Edit3, Trophy,
  Clock, Swords, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { BracketType, BracketMatch, BracketData } from '@/types/bracket';
import { 
  generateSingleElimination, 
  generateDoubleElimination
} from '@/utils/tournamentEngine';

// ============================================
// Match Card Component
// ============================================

interface MatchCardProps {
  match: BracketMatch;
  onClick?: () => void;
  scale: number;
  highlight?: boolean;
}

function MatchCard({ match, onClick, scale, highlight }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <motion.div
      className={`
        w-48 rounded-lg border-2 overflow-hidden cursor-pointer transition-all
        ${highlight ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900' : ''}
        ${isLive ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 
          isFinished ? 'border-emerald-500/50' : 'border-slate-700'}
        bg-slate-800 hover:border-orange-500/50
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {/* Header */}
      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {match.court || `場地 ${match.position + 1}`}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-orange-500">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="p-2 space-y-1">
        {/* Team A */}
        <div className={`
          flex items-center justify-between p-2 rounded
          ${match.teamA?.isWinner ? 'bg-emerald-500/20' : 'bg-slate-900'}
        `}>
          <span className={`
            text-sm truncate flex-1
            ${match.teamA?.isWinner ? 'text-emerald-400 font-medium' : 'text-slate-300'}
          `}>
            {match.teamA?.name || '待定'}
          </span>
          {match.teamA?.score !== undefined && (
            <span className={`
              text-sm font-bold ml-2
              ${match.teamA?.isWinner ? 'text-emerald-400' : 'text-slate-500'}
            `}>
              {match.teamA.score}
            </span>
          )}
        </div>

        {/* Team B */}
        <div className={`
          flex items-center justify-between p-2 rounded
          ${match.teamB?.isWinner ? 'bg-emerald-500/20' : 'bg-slate-900'}
        `}>
          <span className={`
            text-sm truncate flex-1
            ${match.teamB?.isWinner ? 'text-emerald-400 font-medium' : 'text-slate-300'}
          `}>
            {match.teamB?.name || '待定'}
          </span>
          {match.teamB?.score !== undefined && (
            <span className={`
              text-sm font-bold ml-2
              ${match.teamB?.isWinner ? 'text-emerald-400' : 'text-slate-500'}
            `}>
              {match.teamB.score}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      {match.startTime && (
        <div className="px-3 py-1 bg-slate-900 border-t border-slate-700">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {match.startTime}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// SVG Connector Lines
// ============================================

function ConnectorLines({ 
  matches, 
  containerRef,
  type = 'winners'
}: { 
  matches: BracketMatch[]; 
  containerRef: React.RefObject<HTMLDivElement | null>;
  type?: 'winners' | 'losers';
}) {
  const [lines, setLines] = useState<Array<{
    x1: number; y1: number; x2: number; y2: number;
  }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLines: typeof lines = [];

    matches.forEach(match => {
      if (!match.nextMatchId) return;

      const matchEl = document.getElementById(`${type}-${match.id}`);
      const nextMatchEl = document.getElementById(`${type}-${match.nextMatchId}`);

      if (matchEl && nextMatchEl) {
        const matchRect = matchEl.getBoundingClientRect();
        const nextRect = nextMatchEl.getBoundingClientRect();

        const x1 = matchRect.right - containerRect.left;
        const y1 = matchRect.top + matchRect.height / 2 - containerRect.top;
        const x2 = nextRect.left - containerRect.left;
        const y2 = nextRect.top + nextRect.height / 2 - containerRect.top;

        newLines.push({ x1, y1, x2, y2 });
      }
    });

    setLines(newLines);
  }, [matches, containerRef, type]);

  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={`M ${line.x1} ${line.y1} 
              C ${line.x1 + 30} ${line.y1}, 
                ${line.x2 - 30} ${line.y2}, 
                ${line.x2} ${line.y2}`}
          fill="none"
          stroke={type === 'winners' ? '#475569' : '#7c3aed'}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

// ============================================
// Match Editor Modal
// ============================================

function MatchEditor({
  match,
  isOpen,
  onClose,
  onSave,
}: {
  match: BracketMatch | null;
  isOpen: boolean;
  onSave: (match: BracketMatch) => void;
  onClose: () => void;
}) {
  const [teamAScore, setTeamAScore] = useState(match?.teamA?.score?.toString() || '');
  const [teamBScore, setTeamBScore] = useState(match?.teamB?.score?.toString() || '');
  const [status, setStatus] = useState(match?.status || 'pending');

  useEffect(() => {
    setTeamAScore(match?.teamA?.score?.toString() || '');
    setTeamBScore(match?.teamB?.score?.toString() || '');
    setStatus(match?.status || 'pending');
  }, [match]);

  if (!isOpen || !match) return null;

  const handleSave = () => {
    const scoreA = parseInt(teamAScore) || 0;
    const scoreB = parseInt(teamBScore) || 0;
    
    onSave({
      ...match,
      status: status as BracketMatch['status'],
      teamA: match.teamA ? {
        ...match.teamA,
        score: scoreA,
        isWinner: status === 'finished' && scoreA > scoreB,
      } : undefined,
      teamB: match.teamB ? {
        ...match.teamB,
        score: scoreB,
        isWinner: status === 'finished' && scoreB > scoreA,
      } : undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-orange-500" />
            編輯比賽結果
          </h3>

          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                比賽狀態
              </label>
              <div className="flex gap-2">
                {(['pending', 'live', 'finished'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                      ${status === s 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
                    `}
                  >
                    {s === 'pending' && '未開始'}
                    {s === 'live' && '進行中'}
                    {s === 'finished' && '已結束'}
                  </button>
                ))}
              </div>
            </div>

            {/* Team A */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {match.teamA?.name || '隊伍 A'}
              </label>
              <input
                type="number"
                value={teamAScore}
                onChange={(e) => setTeamAScore(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="分數"
              />
            </div>

            {/* Team B */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {match.teamB?.name || '隊伍 B'}
              </label>
              <input
                type="number"
                value={teamBScore}
                onChange={(e) => setTeamBScore(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="分數"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600">
              儲存
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Double Elimination Bracket View
// ============================================

function DoubleEliminationView({
  winnersMatches,
  losersMatches,
  grandFinals,
  onMatchClick,
  scale,
  containerRef,
}: {
  winnersMatches: BracketMatch[];
  losersMatches: BracketMatch[];
  grandFinals: BracketMatch[];
  onMatchClick: (match: BracketMatch) => void;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const winnersByRound = winnersMatches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const losersByRound = losersMatches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const winnerRounds = Object.keys(winnersByRound).map(Number).sort((a, b) => b - a);
  const loserRounds = Object.keys(losersByRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {/* Winners Bracket */}
      <div>
        <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <Swords className="w-5 h-5" /> 勝部賽程
        </h4>
        <div className="relative">
          <ConnectorLines matches={winnersMatches} containerRef={containerRef} type="winners" />
          <div 
            className="flex items-center gap-12 p-6 min-w-max"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            {winnerRounds.map((round) => (
              <div key={`wb-${round}`} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    {round === winnerRounds[0] ? '勝部決賽' : `勝部第 ${winnerRounds[0] - round + 1} 輪`}
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  {winnersByRound[round].map((match) => (
                    <div key={`winners-${match.id}`} id={`winners-${match.id}`}>
                      <MatchCard
                        match={match}
                        onClick={() => onMatchClick(match)}
                        scale={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Losers Bracket */}
      <div>
        <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> 敗部賽程
        </h4>
        <div className="relative">
          <ConnectorLines matches={losersMatches} containerRef={containerRef} type="losers" />
          <div 
            className="flex items-center gap-12 p-6 min-w-max"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            {loserRounds.map((round) => (
              <div key={`lb-${round}`} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    敗部第 {round} 輪
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  {losersByRound[round]?.map((match) => (
                    <div key={`losers-${match.id}`} id={`losers-${match.id}`}>
                      <MatchCard
                        match={match}
                        onClick={() => onMatchClick(match)}
                        scale={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grand Finals */}
      {grandFinals.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <h4 className="text-lg font-bold text-yellow-400 mb-4">總決賽</h4>
          <div className="flex gap-8">
            {grandFinals.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => onMatchClick(match)}
                scale={scale}
                highlight
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Tournament Bracket Component
// ============================================

interface TournamentBracketProps {
  teams?: string[];
  initialData?: BracketData;
  bracketType?: BracketType;
}

export function TournamentBracket({ 
  teams = ['隊伍 A', '隊伍 B', '隊伍 C', '隊伍 D', '隊伍 E', '隊伍 F', '隊伍 G', '隊伍 H'],
  initialData,
  bracketType = 'single',
}: TournamentBracketProps) {
  const [data, setData] = useState<BracketData>(() => 
    initialData || generateSingleElimination(teams)
  );
  const [scale, setScale] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeBracket, setActiveBracket] = useState<BracketType>(bracketType);
  const [showLosers, setShowLosers] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Generate bracket when type changes
  useEffect(() => {
    if (activeBracket === 'double') {
      const doubleData = generateDoubleElimination(teams);
      setData({
        type: 'double',
        rounds: doubleData.winnersBracket.length,
        matches: [
          ...doubleData.winnersBracket.flatMap(r => r.matches),
          ...doubleData.losersBracket.flatMap(r => r.matches),
          ...doubleData.grandFinals,
        ],
        winnersBracket: doubleData.winnersBracket,
        losersBracket: doubleData.losersBracket,
        grandFinals: doubleData.grandFinals,
      });
    } else {
      setData(generateSingleElimination(teams));
    }
  }, [activeBracket, teams]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleMatchClick = (match: BracketMatch) => {
    setSelectedMatch(match);
    setIsEditorOpen(true);
  };

  const handleSaveMatch = useCallback((updatedMatch: BracketMatch) => {
    setData(prev => {
      const newData = { ...prev };
      
      // Update the match
      newData.matches = prev.matches.map(m => 
        m.id === updatedMatch.id ? updatedMatch : m
      );

      // Auto-advance winner if match is finished
      if (updatedMatch.status === 'finished' && updatedMatch.winner) {
        const winner = updatedMatch.winner === 'A' ? updatedMatch.teamA : updatedMatch.teamB;
        const loser = updatedMatch.winner === 'A' ? updatedMatch.teamB : updatedMatch.teamA;

        // Advance winner to next round
        if (updatedMatch.nextMatchId && winner) {
          newData.matches = newData.matches.map(m => {
            if (m.id === updatedMatch.nextMatchId) {
              if (updatedMatch.nextPosition === 'A') {
                return { ...m, teamA: winner };
              } else {
                return { ...m, teamB: winner };
              }
            }
            return m;
          });
        }

        // For double elimination, advance loser to losers bracket
        if (activeBracket === 'double' && loser && updatedMatch.round <= prev.rounds) {
          // Find first empty slot in losers bracket
          const firstLoserMatch = newData.matches.find(m => 
            m.id.startsWith('lb-') && !m.teamA
          );
          if (firstLoserMatch) {
            newData.matches = newData.matches.map(m => 
              m.id === firstLoserMatch.id ? { ...m, teamA: loser } : m
            );
          }
        }
      }

      return newData;
    });

    addToast({
      title: '比賽結果已更新',
      description: updatedMatch.status === 'finished' ? '勝隊已自動晉級' : undefined,
      variant: 'success',
    });
  }, [activeBracket, addToast]);

  const handleDownload = () => {
    addToast({
      title: '賽程圖下載中...',
      description: '即將產生 JPG 圖片',
      variant: 'default',
    });
  };

  // Group matches by round for single elimination
  const matchesByRound = data.matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => b - a);

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            淘汰賽樹狀圖
          </h3>
          
          {/* Bracket Type Selector */}
          <div className="flex items-center gap-2">
            {(['single', 'double'] as BracketType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveBracket(type)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${activeBracket === type 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                `}
              >
                {type === 'single' ? '單敗淘汰' : '雙敗淘汰'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="px-2 py-1 bg-slate-800 rounded">
              {data.rounds} 輪賽事
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded">
              {data.matches.length} 場比賽
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Losers Bracket (for double elimination) */}
          {activeBracket === 'double' && (
            <button
              onClick={() => setShowLosers(!showLosers)}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-400 hover:text-white"
            >
              {showLosers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showLosers ? '隱藏敗部' : '顯示敗部'}
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            onClick={handleDownload}
            className="text-slate-400"
          >
            <Download className="w-4 h-4 mr-1" />
            下載
          </Button>
        </div>
      </div>

      {/* Bracket Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative"
      >
        {activeBracket === 'double' ? (
          <DoubleEliminationView
            winnersMatches={data.matches.filter(m => m.id.startsWith('wb-'))}
            losersMatches={showLosers ? data.matches.filter(m => m.id.startsWith('lb-')) : []}
            grandFinals={data.grandFinals || []}
            onMatchClick={handleMatchClick}
            scale={scale}
            containerRef={containerRef}
          />
        ) : (
          <>
            <ConnectorLines matches={data.matches} containerRef={containerRef} />
            <div 
              className="flex items-center gap-16 p-8 min-w-max"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            >
              {rounds.map((round) => (
                <div key={round} className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium text-slate-400">
                      {round === data.rounds ? '決賽' : 
                       round === data.rounds - 1 ? '準決賽' : 
                       `第 ${data.rounds - round + 1} 輪`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-8">
                    {matchesByRound[round].map((match) => (
                      <div key={match.id} id={match.id}>
                        <MatchCard
                          match={match}
                          onClick={() => handleMatchClick(match)}
                          scale={1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Champion */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>
                <p className="mt-4 text-lg font-bold text-white">冠軍</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Match Editor */}
      <MatchEditor
        match={selectedMatch}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveMatch}
      />
    </div>
  );
}
