import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Zap, AlertTriangle,
  CheckCircle2, RefreshCw, Sun, Moon, Settings, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

// ============================================
// Types
// ============================================

export interface Court {
  id: string;
  name: string;
  available: boolean;
}

export interface Team {
  id: string;
  name: string;
}

export interface ScheduleConfig {
  startDate: string;
  startTime: string;
  endTime: string;
  gameDuration: number;
  breakDuration: number;
  lunchBreak: { start: string; end: string } | null;
  maxGamesPerTeam: number;
  restBetweenGames: number;
}

export interface ScheduledMatch {
  id: string;
  round: number;
  teamA: Team;
  teamB: Team;
  court: Court;
  startTime: Date;
  endTime: Date;
  conflicts?: string[];
}

// ============================================
// Mock Data
// ============================================

const mockTeams: Team[] = [
  { id: '1', name: '猛龍隊' },
  { id: '2', name: '飛鷹隊' },
  { id: '3', name: '閃電俠' },
  { id: '4', name: '暴風雪' },
  { id: '5', name: '火焰鳥' },
  { id: '6', name: '雷霆戰隊' },
  { id: '7', name: '海盜船' },
  { id: '8', name: '巨人隊' },
];

const mockCourts: Court[] = [
  { id: '1', name: 'A場', available: true },
  { id: '2', name: 'B場', available: true },
  { id: '3', name: 'C場', available: true },
  { id: '4', name: 'D場', available: true },
];

// ============================================
// Schedule Generator
// ============================================

function generateRoundRobinSchedule(
  teams: Team[],
  courts: Court[],
  config: ScheduleConfig
): ScheduledMatch[] {
  const matches: ScheduledMatch[] = [];
  const availableCourts = courts.filter(c => c.available);
  
  // Generate all pairings
  const pairings: [Team, Team][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairings.push([teams[i], teams[j]]);
    }
  }

  // Shuffle pairings for variety
  pairings.sort(() => Math.random() - 0.5);

  let currentTime = new Date(`${config.startDate}T${config.startTime}`);
  const endTime = new Date(`${config.startDate}T${config.endTime}`);
  const lunchStart = config.lunchBreak ? new Date(`${config.startDate}T${config.lunchBreak.start}`) : null;
  const lunchEnd = config.lunchBreak ? new Date(`${config.startDate}T${config.lunchBreak.end}`) : null;

  let courtIndex = 0;
  let round = 1;

  for (const [teamA, teamB] of pairings) {
    // Check if we need to move to next time slot
    if (courtIndex >= availableCourts.length) {
      courtIndex = 0;
      currentTime = new Date(currentTime.getTime() + (config.gameDuration + config.breakDuration) * 60000);
      
      // Check lunch break
      if (lunchStart && lunchEnd && currentTime >= lunchStart && currentTime < lunchEnd) {
        currentTime = new Date(lunchEnd);
      }

      // Check if past end time
      if (currentTime >= endTime) {
        currentTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // Next day
        currentTime.setHours(parseInt(config.startTime.split(':')[0]));
        currentTime.setMinutes(parseInt(config.startTime.split(':')[1]));
        round++;
      }
    }

    const endMatchTime = new Date(currentTime.getTime() + config.gameDuration * 60000);

    matches.push({
      id: `match-${matches.length + 1}`,
      round,
      teamA,
      teamB,
      court: availableCourts[courtIndex],
      startTime: new Date(currentTime),
      endTime: endMatchTime,
    });

    courtIndex++;
  }

  return matches;
}

function detectConflicts(matches: ScheduledMatch[]): ScheduledMatch[] {
  const teamLastGame = new Map<string, Date>();

  return matches.map(match => {
    const conflicts: string[] = [];

    // Check if team A had a game recently
    const teamALastGame = teamLastGame.get(match.teamA.id);
    if (teamALastGame) {
      const restMinutes = (match.startTime.getTime() - teamALastGame.getTime()) / 60000;
      if (restMinutes < 30) {
        conflicts.push(`${match.teamA.name} 休息時間不足 (${Math.round(restMinutes)} 分鐘)`);
      }
    }

    // Check if team B had a game recently
    const teamBLastGame = teamLastGame.get(match.teamB.id);
    if (teamBLastGame) {
      const restMinutes = (match.startTime.getTime() - teamBLastGame.getTime()) / 60000;
      if (restMinutes < 30) {
        conflicts.push(`${match.teamB.name} 休息時間不足 (${Math.round(restMinutes)} 分鐘)`);
      }
    }

    // Update last game times
    teamLastGame.set(match.teamA.id, match.endTime);
    teamLastGame.set(match.teamB.id, match.endTime);

    return { ...match, conflicts };
  });
}

// ============================================
// Components
// ============================================

function ConfigPanel({
  config,
  onChange,
}: {
  config: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <Settings className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-white">排程設定</h3>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" /> 開始日期
        </label>
        <input
          type="date"
          value={config.startDate}
          onChange={(e) => onChange({ ...config, startDate: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Sun className="w-4 h-4 inline mr-1" /> 開始時間
          </label>
          <input
            type="time"
            value={config.startTime}
            onChange={(e) => onChange({ ...config, startTime: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Moon className="w-4 h-4 inline mr-1" /> 結束時間
          </label>
          <input
            type="time"
            value={config.endTime}
            onChange={(e) => onChange({ ...config, endTime: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Game Duration */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Clock className="w-4 h-4 inline mr-1" /> 每場比賽時間（分鐘）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="10"
            max="120"
            value={config.gameDuration}
            onChange={(e) => onChange({ ...config, gameDuration: parseInt(e.target.value) })}
            className="flex-1 accent-orange-500"
          />
          <span className="w-12 text-center text-orange-400 font-bold">{config.gameDuration}</span>
        </div>
      </div>

      {/* Break Duration */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Clock className="w-4 h-4 inline mr-1" /> 場間休息（分鐘）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="30"
            value={config.breakDuration}
            onChange={(e) => onChange({ ...config, breakDuration: parseInt(e.target.value) })}
            className="flex-1 accent-orange-500"
          />
          <span className="w-12 text-center text-orange-400 font-bold">{config.breakDuration}</span>
        </div>
      </div>

      {/* Lunch Break Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">午休時間</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!config.lunchBreak}
            onChange={(e) => onChange({
              ...config,
              lunchBreak: e.target.checked ? { start: '12:00', end: '13:00' } : null,
            })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
      </div>

      {/* Lunch Break Time */}
      <AnimatePresence>
        {config.lunchBreak && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-xs text-slate-400 mb-1">午休開始</label>
              <input
                type="time"
                value={config.lunchBreak.start}
                onChange={(e) => onChange({
                  ...config,
                  lunchBreak: { ...config.lunchBreak!, start: e.target.value },
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">午休結束</label>
              <input
                type="time"
                value={config.lunchBreak.end}
                onChange={(e) => onChange({
                  ...config,
                  lunchBreak: { ...config.lunchBreak!, end: e.target.value },
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Between Games */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Users className="w-4 h-4 inline mr-1" /> 隊伍最短休息時間（分鐘）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="60"
            value={config.restBetweenGames}
            onChange={(e) => onChange({ ...config, restBetweenGames: parseInt(e.target.value) })}
            className="flex-1 accent-orange-500"
          />
          <span className="w-12 text-center text-orange-400 font-bold">{config.restBetweenGames}</span>
        </div>
      </div>
    </div>
  );
}

function SchedulePreview({
  matches,
  onRegenerate,
}: {
  matches: ScheduledMatch[];
  onRegenerate: () => void;
}) {
  const { addToast } = useToast();

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const groups: Record<string, ScheduledMatch[]> = {};
    matches.forEach(match => {
      const date = match.startTime.toLocaleDateString('zh-TW');
      if (!groups[date]) groups[date] = [];
      groups[date].push(match);
    });
    return groups;
  }, [matches]);

  const conflictCount = matches.filter(m => m.conflicts?.length).length;

  const handleApply = () => {
    addToast({
      title: '賽程已套用',
      description: `共 ${matches.length} 場比賽`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-white">排程預覽</h3>
        </div>
        <div className="flex items-center gap-2">
          {conflictCount > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {conflictCount} 個衝突
            </span>
          )}
          <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">
            {matches.length} 場比賽
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>點擊「自動排程」產生賽程</p>
        </div>
      ) : (
        <>
          <div className="space-y-6 max-h-[500px] overflow-y-auto">
            {Object.entries(matchesByDate).map(([date, dayMatches]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-slate-400 mb-3 sticky top-0 bg-slate-900 py-2">
                  {date}
                </h4>
                <div className="space-y-2">
                  {dayMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        p-3 rounded-lg border
                        ${match.conflicts?.length 
                          ? 'border-red-500/50 bg-red-500/10' 
                          : 'border-slate-700 bg-slate-800'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">
                            {match.startTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {match.endTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                            {match.court.name}
                          </span>
                        </div>
                        {match.conflicts?.length ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-white font-medium">{match.teamA.name}</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-white font-medium">{match.teamB.name}</span>
                      </div>
                      {match.conflicts?.map((conflict, i) => (
                        <p key={i} className="text-xs text-red-400 mt-1">
                          ⚠️ {conflict}
                        </p>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={onRegenerate}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重新排程
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={conflictCount > 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              套用賽程
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Main Auto Scheduler Component
// ============================================

interface AutoSchedulerProps {
  teams?: Team[];
  courts?: Court[];
}

export function AutoScheduler({
  teams = mockTeams,
  courts = mockCourts,
}: AutoSchedulerProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    gameDuration: 30,
    breakDuration: 10,
    lunchBreak: { start: '12:00', end: '13:00' },
    maxGamesPerTeam: 3,
    restBetweenGames: 30,
  });

  const [matches, setMatches] = useState<ScheduledMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate processing
    setTimeout(() => {
      const generated = generateRoundRobinSchedule(teams, courts, config);
      const withConflicts = detectConflicts(generated);
      setMatches(withConflicts);
      setIsGenerating(false);
      
      const conflictCount = withConflicts.filter(m => m.conflicts?.length).length;
      addToast({
        title: '賽程產生完成',
        description: conflictCount > 0 
          ? `發現 ${conflictCount} 個衝突，請檢查後調整` 
          : '無衝突，可直接套用',
        variant: conflictCount > 0 ? 'warning' : 'success',
      });
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">自動排程</h2>
              <p className="text-sm text-slate-400">一鍵產生最佳賽程安排</p>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? '排程中...' : '自動排程'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-2 gap-0">
          {/* Left - Config */}
          <div className="h-full overflow-y-auto p-6 border-r border-slate-800">
            <ConfigPanel config={config} onChange={setConfig} />
          </div>

          {/* Right - Preview */}
          <div className="h-full overflow-y-auto p-6">
            <SchedulePreview
              matches={matches}
              onRegenerate={handleGenerate}
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {matches.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">隊伍：</span>
              <span className="text-white font-medium">{teams.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">場地：</span>
              <span className="text-white font-medium">{courts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">比賽：</span>
              <span className="text-white font-medium">{matches.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">天數：</span>
              <span className="text-white font-medium">
                {new Set(matches.map(m => m.startTime.toDateString())).size}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
