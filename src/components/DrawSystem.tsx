import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Play, RotateCcw, Users, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

interface DrawSystemProps {
  teams: string[];
  onComplete?: (drawnTeams: string[]) => void;
  className?: string;
}

interface DrawResult {
  position: number;
  team: string;
  group?: string;
}

export function DrawSystem({ teams, onComplete, className = '' }: DrawSystemProps) {
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [tempTeam, setTempTeam] = useState<string>('');
  const { addToast } = useToast();

  const remainingTeams = teams.filter(
    team => !drawResults.some(r => r.team === team)
  );

  const handleDraw = useCallback(async () => {
    if (remainingTeams.length === 0) {
      addToast({
        title: '抽籤完成',
        description: '所有隊伍已完成抽籤',
        variant: 'success',
      });
      onComplete?.(drawResults.map(r => r.team));
      return;
    }

    setIsDrawing(true);
    setShowAnimation(true);

    // Animation: shuffle through remaining teams
    const shuffleCount = 20;
    const shuffleInterval = 100;

    for (let i = 0; i < shuffleCount; i++) {
      const randomIndex = Math.floor(Math.random() * remainingTeams.length);
      setTempTeam(remainingTeams[randomIndex]);
      await new Promise(resolve => setTimeout(resolve, shuffleInterval));
    }

    // Final selection
    const finalIndex = Math.floor(Math.random() * remainingTeams.length);
    const selectedTeam = remainingTeams[finalIndex];

    setShowAnimation(false);
    setTempTeam('');
    
    const newResult: DrawResult = {
      position: drawResults.length + 1,
      team: selectedTeam,
    };

    setDrawResults(prev => [...prev, newResult]);
    setIsDrawing(false);

    addToast({
      title: `第 ${newResult.position} 順位`,
      description: selectedTeam,
      variant: 'default',
    });
  }, [remainingTeams, drawResults, onComplete, addToast]);

  const handleReset = useCallback(() => {
    setDrawResults([]);
    setIsDrawing(false);
    setShowAnimation(false);
    setTempTeam('');
    
    addToast({
      title: '重新抽籤',
      description: '已重置抽籤結果',
      variant: 'default',
    });
  }, [addToast]);

  const handleComplete = useCallback(() => {
    if (drawResults.length === 0) {
      addToast({
        title: '無法完成',
        description: '請先進行抽籤',
        variant: 'warning',
      });
      return;
    }

    onComplete?.(drawResults.map(r => r.team));
    
    addToast({
      title: '抽籤完成',
      description: `共抽出 ${drawResults.length} 隊`,
      variant: 'success',
    });
  }, [drawResults, onComplete, addToast]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Draw Animation Display */}
      <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <div className="text-center">
          <AnimatePresence mode="wait">
            {showAnimation ? (
              <motion.div
                key="animating"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="py-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 0.5, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 0.3, repeat: Infinity },
                  }}
                  className="inline-block mb-4"
                >
                  <Shuffle className="w-16 h-16 text-orange-500" />
                </motion.div>
                <p className="text-4xl font-bold text-white mb-2">{tempTeam}</p>
                <p className="text-slate-400">正在抽籤...</p>
              </motion.div>
            ) : drawResults.length > 0 ? (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Trophy className="w-12 h-12 text-orange-500" />
                  <span className="text-6xl font-bold text-white">
                    {drawResults[drawResults.length - 1].position}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {drawResults[drawResults.length - 1].team}
                </p>
                <p className="text-slate-400">
                  第 {drawResults.length} / {teams.length} 順位
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8"
              >
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-white mb-2">準備抽籤</p>
                <p className="text-slate-400">共 {teams.length} 隊參與抽籤</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 px-8"
          onClick={handleDraw}
          disabled={isDrawing || remainingTeams.length === 0}
        >
          {isDrawing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          {remainingTeams.length === 0 ? '抽籤完成' : '開始抽籤'}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          disabled={isDrawing || drawResults.length === 0}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          重新開始
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleComplete}
          disabled={isDrawing || drawResults.length === 0}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          確認結果
        </Button>
      </div>

      {/* Progress */}
      <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: `${(drawResults.length / teams.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-center text-sm text-slate-400">
        已抽 {drawResults.length} / {teams.length} 隊
      </p>

      {/* Results List */}
      {drawResults.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h4 className="font-bold text-white mb-3">抽籤結果</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {drawResults.map((result, index) => (
              <motion.div
                key={result.team}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg"
              >
                <span className="w-8 h-8 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {result.position}
                </span>
                <span className="text-white flex-1">{result.team}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Remaining Teams */}
      {remainingTeams.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h4 className="font-bold text-white mb-3">待抽籤隊伍 ({remainingTeams.length})</h4>
          <div className="flex flex-wrap gap-2">
            {remainingTeams.map((team) => (
              <span
                key={team}
                className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full"
              >
                {team}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Group Draw Component
interface GroupDrawProps {
  teams: string[];
  numGroups: number;
  onComplete?: (groups: Record<string, string[]>) => void;
}

export function GroupDraw({ teams, numGroups, onComplete }: GroupDrawProps) {
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const { addToast } = useToast();

  const handleDraw = useCallback(async () => {
    setIsDrawing(true);

    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    // Distribute to groups (snake/serpentine for fairness)
    const newGroups: Record<string, string[]> = {};
    for (let i = 1; i <= numGroups; i++) {
      newGroups[`A${i}`] = [];
    }

    shuffled.forEach((team, index) => {
      const groupIndex = index % numGroups;
      const groupKey = `A${groupIndex + 1}`;
      newGroups[groupKey].push(team);
    });

    // Animate
    await new Promise(resolve => setTimeout(resolve, 1000));

    setGroups(newGroups);
    setIsDrawing(false);

    addToast({
      title: '分組完成',
      description: `已將 ${teams.length} 隊分到 ${numGroups} 組`,
      variant: 'success',
    });

    onComplete?.(newGroups);
  }, [teams, numGroups, onComplete, addToast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600"
          onClick={handleDraw}
          disabled={isDrawing}
        >
          {isDrawing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
          ) : (
            <Shuffle className="w-5 h-5 mr-2" />
          )}
          開始分組
        </Button>
      </div>

      {Object.keys(groups).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(groups).map(([groupName, groupTeams], index) => (
            <motion.div
              key={groupName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h4 className="font-bold text-orange-500 mb-3">{groupName} 組</h4>
                <div className="space-y-2">
                  {groupTeams.map((team, i) => (
                    <div
                      key={team}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <span className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {team}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
