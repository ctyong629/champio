import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

import type { RouteType } from '@/App';

interface ScorekeeperAppProps {
  setRoute: (route: RouteType) => void;
}

export function ScorekeeperApp({ setRoute }: ScorekeeperAppProps) {
  const [scoreA, setScoreA] = useState(78);
  const [scoreB, setScoreB] = useState(65);
  const [foulsA, setFoulsA] = useState(3);
  const [foulsB, setFoulsB] = useState(2);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAction, setLastAction] = useState<{ team: 'A' | 'B'; points: number } | null>(null);
  const { addToast } = useToast();

  const handleScore = (team: 'A' | 'B', points: number) => {
    if (team === 'A') {
      setScoreA(s => s + points);
    } else {
      setScoreB(s => s + points);
    }
    setLastAction({ team, points });
    setShowUndo(true);
    
    // Auto hide undo after 3 seconds
    setTimeout(() => setShowUndo(false), 3000);
  };

  const handleUndo = () => {
    if (lastAction) {
      if (lastAction.team === 'A') {
        setScoreA(s => Math.max(0, s - lastAction.points));
      } else {
        setScoreB(s => Math.max(0, s - lastAction.points));
      }
      setShowUndo(false);
      addToast({
        title: '已撤銷',
        description: `撤銷了 ${lastAction.points} 分`,
        variant: 'default'
      });
    }
  };

  const handleFoul = (team: 'A' | 'B') => {
    if (team === 'A') {
      setFoulsA(f => Math.min(5, f + 1));
      if (foulsA + 1 >= 5) {
        addToast({
          title: '犯規警告',
          description: '猛龍隊已達 5 次犯規，對方將獲得罰球',
          variant: 'warning'
        });
      }
    } else {
      setFoulsB(f => Math.min(5, f + 1));
      if (foulsB + 1 >= 5) {
        addToast({
          title: '犯規警告',
          description: '飛鷹隊已達 5 次犯規，對方將獲得罰球',
          variant: 'warning'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Top Control Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <Button variant="ghost" className="px-2" onClick={() => setRoute('public_event')}>
          <ChevronLeft className="w-6 h-6" /> 返回
        </Button>
        <div className="text-center">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-sm px-3 py-1">第一節 - 08:42</Badge>
        </div>
        <Button variant="outline" className="border-slate-700 text-xs">
          <Settings className="w-4 h-4 mr-1" /> 設定
        </Button>
      </div>

      {/* Score Display - Large */}
      <div className="h-24 bg-slate-900 flex items-center justify-center gap-8 border-b border-slate-800">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">猛龍隊</p>
          <p className="text-4xl font-bold text-white">{scoreA}</p>
        </div>
        <div className="text-2xl text-slate-600">VS</div>
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">飛鷹隊</p>
          <p className="text-4xl font-bold text-white">{scoreB}</p>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Team A */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col relative bg-gradient-to-br from-slate-900 to-slate-950">
          {/* Foul indicator */}
          <div className="absolute top-4 left-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < foulsA ? 'bg-red-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              className="text-[8rem] md:text-[12rem] font-display text-white leading-none"
              key={scoreA}
              initial={{ scale: 1.2, color: '#f97316' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              {scoreA}
            </motion.div>
          </div>
          
          {/* Score buttons */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <motion.button 
              onClick={() => handleScore('A', 1)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl h-20 md:h-24 text-2xl font-bold border border-slate-700 shadow-lg active:bg-slate-600"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +1
            </motion.button>
            <motion.button 
              onClick={() => handleScore('A', 2)}
              className="bg-orange-600 hover:bg-orange-500 text-white rounded-2xl h-20 md:h-24 text-3xl font-bold border border-orange-500 shadow-lg shadow-orange-500/20 active:bg-orange-400"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +2
            </motion.button>
            <motion.button 
              onClick={() => handleScore('A', 3)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl h-20 md:h-24 text-2xl font-bold border border-slate-700 shadow-lg active:bg-slate-600"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +3
            </motion.button>
          </div>
          
          <div className="flex gap-3">
             <motion.button 
               onClick={() => setScoreA(s => Math.max(0, s - 1))}
               className="flex-1 bg-slate-900 text-slate-500 rounded-xl py-3 border border-slate-800 text-sm"
               whileTap={{ scale: 0.95 }}
             >
               -1 (修正)
             </motion.button>
             <motion.button 
               onClick={() => handleFoul('A')}
               className="flex-1 bg-red-500/20 text-red-500 rounded-xl py-3 border border-red-500/50 text-sm font-medium"
               whileTap={{ scale: 0.95 }}
             >
               犯規 ({foulsA})
             </motion.button>
          </div>
        </div>

        {/* Team B */}
        <div className="flex-1 p-4 flex flex-col relative bg-gradient-to-bl from-slate-900 to-slate-950">
          {/* Foul indicator */}
          <div className="absolute top-4 left-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < foulsB ? 'bg-red-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              className="text-[8rem] md:text-[12rem] font-display text-white leading-none"
              key={scoreB}
              initial={{ scale: 1.2, color: '#f97316' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              {scoreB}
            </motion.div>
          </div>
          
          {/* Score buttons */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <motion.button 
              onClick={() => handleScore('B', 1)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl h-20 md:h-24 text-2xl font-bold border border-slate-700 shadow-lg active:bg-slate-600"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +1
            </motion.button>
            <motion.button 
              onClick={() => handleScore('B', 2)}
              className="bg-slate-600 hover:bg-slate-500 text-white rounded-2xl h-20 md:h-24 text-3xl font-bold border border-slate-600 shadow-lg active:bg-slate-400"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +2
            </motion.button>
            <motion.button 
              onClick={() => handleScore('B', 3)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl h-20 md:h-24 text-2xl font-bold border border-slate-700 shadow-lg active:bg-slate-600"
              whileTap={{ scale: 0.95 }}
              style={{ touchAction: 'manipulation' }}
            >
              +3
            </motion.button>
          </div>
          
          <div className="flex gap-3">
             <motion.button 
               onClick={() => setScoreB(s => Math.max(0, s - 1))}
               className="flex-1 bg-slate-900 text-slate-500 rounded-xl py-3 border border-slate-800 text-sm"
               whileTap={{ scale: 0.95 }}
             >
               -1 (修正)
             </motion.button>
             <motion.button 
               onClick={() => handleFoul('B')}
               className="flex-1 bg-red-500/20 text-red-500 rounded-xl py-3 border border-red-500/50 text-sm font-medium"
               whileTap={{ scale: 0.95 }}
             >
               犯規 ({foulsB})
             </motion.button>
          </div>
        </div>
      </div>

      {/* Undo notification */}
      <AnimatePresence>
        {showUndo && (
          <motion.div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <span className="text-slate-300 text-sm">已加分</span>
            <button 
              onClick={handleUndo}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              撤銷
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
