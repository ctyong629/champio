import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shuffle, Play, RotateCcw, Trophy, Sparkles,
  Users, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

// ============================================
// Types
// ============================================

interface Team {
  id: string;
  name: string;
  logo?: string;
  drawn?: boolean;
  position?: number;
}

interface DrawResult {
  team: Team;
  position: number;
  animation: 'slot' | 'roulette' | 'shuffle';
}

// ============================================
// Slot Machine Animation
// ============================================

function SlotMachineDraw({
  teams,
  onComplete,
}: {
  teams: Team[];
  onComplete: (result: DrawResult) => void;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [result, setResult] = useState<Team | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDraw = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);

    // Fast shuffle animation
    let speed = 50;
    let duration = 2000;
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * teams.length));
      
      // Slow down near the end
      const elapsed = Date.now() - startTime;
      if (elapsed > duration * 0.7 && speed < 200) {
        speed += 20;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setDisplayIndex(Math.floor(Math.random() * teams.length));
          }, speed);
        }
      }
    }, speed);

    // Stop after duration
    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const winningIndex = Math.floor(Math.random() * teams.length);
      const winningTeam = teams[winningIndex];
      
      setDisplayIndex(winningIndex);
      setResult(winningTeam);
      setIsSpinning(false);
      
      onComplete({
        team: winningTeam,
        position: winningIndex + 1,
        animation: 'slot',
      });
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="text-center">
      {/* Display Area */}
      <div className="relative h-48 mb-8">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={isSpinning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.1, repeat: Infinity }}
        >
          <div className={`
            w-64 h-32 rounded-2xl flex items-center justify-center
            ${isSpinning ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-slate-800'}
            border-4 ${isSpinning ? 'border-orange-400' : 'border-slate-600'}
            shadow-2xl
          `}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isSpinning ? displayIndex : 'result'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {result ? (
                  <div>
                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{result.name}</p>
                    <p className="text-orange-200">籤號 {teams.findIndex(t => t.id === result.id) + 1}</p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {teams[displayIndex]?.name}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Light effects */}
        {isSpinning && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                style={{
                  top: `${20 + Math.sin(i * Math.PI / 4) * 80}px`,
                  left: `${50 + Math.cos(i * Math.PI / 4) * 140}px`,
                }}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Controls */}
      <Button
        onClick={startDraw}
        disabled={isSpinning || teams.length === 0}
        className={`
          px-8 py-4 text-lg font-bold rounded-xl transition-all
          ${isSpinning 
            ? 'bg-slate-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}
        `}
      >
        {isSpinning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
          />
        ) : (
          <Play className="w-5 h-5 mr-2 inline" />
        )}
        {isSpinning ? '抽籤中...' : '開始抽籤'}
      </Button>
    </div>
  );
}

// ============================================
// Card Shuffle Animation
// ============================================

function CardShuffleDraw({
  teams,
  onComplete,
}: {
  teams: Team[];
  onComplete: (result: DrawResult) => void;
}) {
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{ id: string; x: number; y: number; rotation: number }[]>([]);

  // Initialize card positions
  useEffect(() => {
    const positions = teams.map((team, i) => ({
      id: team.id,
      x: (i % 4) * 140 - 210,
      y: Math.floor(i / 4) * 100 - 100,
      rotation: (Math.random() - 0.5) * 20,
    }));
    setCardPositions(positions);
  }, [teams]);

  const shuffle = async () => {
    if (shuffling) return;
    
    setShuffling(true);
    setRevealed(null);

    // Shuffle animation
    for (let i = 0; i < 10; i++) {
      setCardPositions(prev => 
        prev.map(card => ({
          ...card,
          x: card.x + (Math.random() - 0.5) * 100,
          y: card.y + (Math.random() - 0.5) * 50,
          rotation: (Math.random() - 0.5) * 30,
        }))
      );
      await new Promise(r => setTimeout(r, 100));
    }

    // Return to grid
    const finalPositions = teams.map((team, i) => ({
      id: team.id,
      x: (i % 4) * 140 - 210,
      y: Math.floor(i / 4) * 100 - 100,
      rotation: 0,
    }));
    setCardPositions(finalPositions);

    // Reveal winner
    const winner = teams[Math.floor(Math.random() * teams.length)];
    setRevealed(winner.id);
    setShuffling(false);

    onComplete({
      team: winner,
      position: teams.findIndex(t => t.id === winner.id) + 1,
      animation: 'shuffle',
    });
  };

  return (
    <div className="text-center">
      {/* Cards Area */}
      <div className="relative h-80 mb-8 flex items-center justify-center">
        <div className="relative w-full max-w-2xl h-full">
          {teams.map((team, i) => {
            const pos = cardPositions.find(p => p.id === team.id);
            const isRevealed = revealed === team.id;
            
            return (
              <motion.div
                key={team.id}
                className="absolute left-1/2 top-1/2"
                animate={{
                  x: pos?.x || 0,
                  y: pos?.y || 0,
                  rotate: pos?.rotation || 0,
                  scale: isRevealed ? 1.2 : 1,
                  zIndex: isRevealed ? 10 : 1,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ marginLeft: '-60px', marginTop: '-40px' }}
              >
                <motion.div
                  className={`
                    w-28 h-20 rounded-xl flex items-center justify-center cursor-pointer
                    ${isRevealed 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 border-2 border-yellow-400' 
                      : 'bg-slate-700 border border-slate-600'}
                    shadow-lg
                  `}
                  whileHover={!shuffling ? { scale: 1.05 } : {}}
                  onClick={() => !shuffling && shuffle()}
                >
                  {isRevealed ? (
                    <div className="text-center">
                      <Sparkles className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{team.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-500">?</p>
                      <p className="text-xs text-slate-600">{i + 1}</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <Button
        onClick={shuffle}
        disabled={shuffling}
        className={`
          px-8 py-4 text-lg font-bold rounded-xl transition-all
          ${shuffling 
            ? 'bg-slate-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'}
        `}
      >
        {shuffling ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
          />
        ) : (
          <Shuffle className="w-5 h-5 mr-2 inline" />
        )}
        {shuffling ? '洗牌中...' : '洗牌抽籤'}
      </Button>
    </div>
  );
}

// ============================================
// Roulette Wheel Animation
// ============================================

function RouletteDraw({
  teams,
  onComplete,
}: {
  teams: Team[];
  onComplete: (result: DrawResult) => void;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Team | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw roulette wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const anglePerSegment = (2 * Math.PI) / teams.length;

    teams.forEach((team, i) => {
      const startAngle = i * anglePerSegment + (rotation * Math.PI / 180);
      const endAngle = (i + 1) * anglePerSegment + (rotation * Math.PI / 180);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(team.name.slice(0, 4), radius - 20, 4);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 10, centerY);
    ctx.lineTo(centerX + radius - 10, centerY - 10);
    ctx.lineTo(centerX + radius - 10, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
  }, [teams, rotation]);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 5; // 5-10 spins
    const finalRotation = rotation + spins * 360;
    const winnerIndex = Math.floor(((360 - (finalRotation % 360)) / 360) * teams.length) % teams.length;

    // Animate rotation
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
      
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(teams[winnerIndex]);
        onComplete({
          team: teams[winnerIndex],
          position: winnerIndex + 1,
          animation: 'roulette',
        });
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="text-center">
      {/* Wheel */}
      <div className="relative h-80 mb-8 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full"
        />
        
        {/* Winner display */}
        <AnimatePresence>
          {winner && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
            >
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{winner.name}</p>
                <p className="text-orange-400">中籤！</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <Button
        onClick={spin}
        disabled={isSpinning}
        className={`
          px-8 py-4 text-lg font-bold rounded-xl transition-all
          ${isSpinning 
            ? 'bg-slate-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'}
        `}
      >
        {isSpinning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
          />
        ) : (
          <RotateCcw className="w-5 h-5 mr-2 inline" />
        )}
        {isSpinning ? '轉動中...' : '轉動輪盤'}
      </Button>
    </div>
  );
}

// ============================================
// Main Draw Animation Component
// ============================================

type AnimationType = 'slot' | 'shuffle' | 'roulette';

interface DrawAnimationProps {
  teams: Team[];
  onComplete?: (results: DrawResult[]) => void;
  animationType?: AnimationType;
}

export function DrawAnimation({
  teams: initialTeams,
  onComplete,
  animationType = 'slot',
}: DrawAnimationProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [currentType, setCurrentType] = useState<AnimationType>(animationType);
  const { addToast } = useToast();

  const handleSingleDraw = (result: DrawResult) => {
    const newResults = [...results, result];
    setResults(newResults);
    
    // Mark team as drawn
    setTeams(prev => 
      prev.map(t => t.id === result.team.id ? { ...t, drawn: true } : t)
    );

    addToast({
      title: '抽籤完成！',
      description: `${result.team.name} 抽到籤號 ${result.position}`,
      variant: 'success',
    });

    if (newResults.length === initialTeams.length) {
      onComplete?.(newResults);
    }
  };

  const reset = () => {
    setResults([]);
    setTeams(initialTeams.map(t => ({ ...t, drawn: false })));
  };

  const remainingTeams = teams.filter(t => !t.drawn);
  const progress = (results.length / initialTeams.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-slate-400">
              已抽籤: <span className="text-white font-bold">{results.length}</span> / {initialTeams.length}
            </span>
          </div>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Animation Type Selector */}
        <div className="flex items-center gap-2">
          {(['slot', 'shuffle', 'roulette'] as AnimationType[]).map((type) => (
            <button
              key={type}
              onClick={() => setCurrentType(type)}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-colors
                ${currentType === type 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
              `}
            >
              {type === 'slot' && '拉霸機'}
              {type === 'shuffle' && '洗牌'}
              {type === 'roulette' && '輪盤'}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Area */}
      <Card className="p-8 bg-slate-800 border-slate-700">
        {remainingTeams.length > 0 ? (
          <>
            {currentType === 'slot' && (
              <SlotMachineDraw teams={remainingTeams} onComplete={handleSingleDraw} />
            )}
            {currentType === 'shuffle' && (
              <CardShuffleDraw teams={remainingTeams} onComplete={handleSingleDraw} />
            )}
            {currentType === 'roulette' && (
              <RouletteDraw teams={remainingTeams} onComplete={handleSingleDraw} />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">抽籤完成！</h3>
            <p className="text-slate-400 mb-6">所有隊伍已完成抽籤</p>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新抽籤
            </Button>
          </div>
        )}
      </Card>

      {/* Results List */}
      {results.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            抽籤結果
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {results.map((result, i) => (
              <motion.div
                key={result.team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg"
              >
                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {result.position}
                </span>
                <span className="text-sm text-white truncate">{result.team.name}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
