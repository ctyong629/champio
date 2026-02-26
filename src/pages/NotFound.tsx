import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { RouteType } from '@/App';

interface NotFoundProps {
  setRoute: (route: RouteType) => void;
}

export function NotFound({ setRoute }: NotFoundProps) {
  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100">
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-8xl font-display font-bold text-orange-500 drop-shadow-lg"
          animate={{ 
            textShadow: [
              '0 0 20px rgba(249, 115, 22, 0.3)',
              '0 0 40px rgba(249, 115, 22, 0.5)',
              '0 0 20px rgba(249, 115, 22, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          404
        </motion.h1>
        <p className="text-xl text-slate-400 font-medium">哎呀！找不到這個頁面 (Page not found)</p>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy className="w-16 h-16 text-slate-600 mx-auto my-6" />
        </motion.div>
        <Button 
          className="mt-4 px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" 
          onClick={() => setRoute('home')}
        >
          返回首頁
        </Button>
      </motion.div>
    </div>
  );
}
