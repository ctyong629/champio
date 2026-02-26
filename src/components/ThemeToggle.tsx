import { motion } from 'framer-motion';
import { Moon, Sun, Droplets, Minus } from 'lucide-react';
import { useTheme } from '@/contexts/AppContext';
import type { ThemeType } from '@/types';

const themes: { id: ThemeType; name: string; icon: typeof Moon; color: string }[] = [
  { id: 'dark', name: '深邃曜黑', icon: Moon, color: '#0f172a' },
  { id: 'orange', name: '熱血橘紅', icon: Sun, color: '#c2410c' },
  { id: 'blue', name: '海洋湛藍', icon: Droplets, color: '#1e3a5f' },
  { id: 'minimal', name: '極簡純白', icon: Minus, color: '#f8fafc' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;

        return (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              relative flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
              ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={t.name}
          >
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-slate-700 rounded-md"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.name}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for navbar
export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useTheme();

  const currentTheme = themes.find(t => t.id === theme);
  const Icon = currentTheme?.icon || Moon;

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`目前主題: ${currentTheme?.name}`}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  );
}
