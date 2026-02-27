import { useState, memo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Layout, LogIn, Menu, X, 
  Search, Command, User, LogOut, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchModal } from './SearchModal';
import { ThemeToggle } from './ThemeProvider';
import type { SportType } from '@/types';
import type { RouteType } from '@/App';

// 🌟 引入路由與 Firebase Auth
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// Constants
// ============================================

const sportOptions: { value: SportType; label: string }[] = [
  { value: 'basketball', label: '🏀 籃球' },
  { value: 'volleyball', label: '🏐 排球' },
  { value: 'soccer', label: '⚽ 足球' },
  { value: 'softball', label: '🥎 壘球' },
  { value: 'badminton', label: '🏸 羽球' },
  { value: 'tabletennis', label: '🏓 桌球' },
  { value: 'beachvolleyball', label: '🏖️ 沙排' },
  { value: 'other', label: '🎯 其他' },
];

// ============================================
// Types
// ============================================

interface NavbarProps {
  setRoute: (route: RouteType) => void;
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  onSearchSelect: (type: string, id: string) => void;
}

// ============================================
// Components
// ============================================

const Logo = memo(function Logo({ onClick }: { onClick: () => void }) {
  return (
    <motion.div 
      className="flex items-center gap-2 cursor-pointer group shrink-0" 
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img src="/champio-logo.png" alt="Champio" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
      <span className="font-display text-2xl tracking-widest text-white group-hover:text-orange-400 transition-colors mt-1">
        CHAMPIO
      </span>
    </motion.div>
  );
});

const SportTabs = memo(function SportTabs({ activeSport, onChange }: { activeSport: SportType; onChange: (sport: SportType) => void; }) {
  return (
    <div className="hidden items-center gap-1 md:flex overflow-x-auto mx-4 no-scrollbar">
      {sportOptions.map((s) => (
        <button
          key={s.value}
          className={`relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeSport === s.value ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          onClick={() => onChange(s.value)}
        >
          {s.label}
          {activeSport === s.value && (
            <motion.div layoutId="activeSport" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          )}
        </button>
      ))}
    </div>
  );
});

const SearchButton = memo(function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    >
      <Search className="w-4 h-4" />
      <span className="hidden lg:inline">搜尋賽事...</span>
      <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-700 rounded text-xs"><Command className="w-3 h-3" />K</kbd>
    </motion.button>
  );
});

// 🌟 全新的 UserMenu：根據真實登入者顯示下拉選單
function UserMenu({ onNavigate }: { onNavigate: (route: RouteType) => void }) {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <Button variant="outline" className="hidden md:flex h-9 border-orange-500/50 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors" onClick={() => onNavigate('login')}>
        <LogIn className="mr-2 h-4 w-4" /> 登入 / 註冊
      </Button>
    );
  }

  const initial = currentUser.email ? currentUser.email[0].toUpperCase() : 'U';

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors bg-slate-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
          {initial}
        </div>
        <span className="text-sm font-medium text-slate-200 truncate max-w-[100px]">{currentUser.email?.split('@')[0]}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-2 mb-2 border-b border-slate-700/50">
              <p className="text-xs text-slate-400">登入為</p>
              <p className="text-sm text-white font-medium truncate">{currentUser.email}</p>
            </div>
            
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors" onClick={() => { onNavigate('dashboard'); setIsOpen(false); }}>
              <Layout className="w-4 h-4 text-orange-400" /> 主控台 (主辦方)
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors" onClick={() => { onNavigate('member'); setIsOpen(false); }}>
              <User className="w-4 h-4 text-blue-400" /> 會員中心 (隊長/隊員)
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors" onClick={() => { onNavigate('wizard'); setIsOpen(false); }}>
              <Globe className="w-4 h-4 text-emerald-400" /> 建立新賽事
            </button>
            
            <div className="h-px bg-slate-700 my-2 mx-4" />
            
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors" 
              onClick={async () => { await logout(); onNavigate('home'); setIsOpen(false); }}
            >
              <LogOut className="w-4 h-4" /> 安全登出
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Main Navbar Component
// ============================================

export const Navbar = memo(function Navbar({
  setRoute, activeSport, setActiveSport, isSearchOpen, setIsSearchOpen, onSearchSelect
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleNavigate = useCallback((newRoute: RouteType) => {
    setRoute(newRoute);
    setMobileOpen(false);
  }, [setRoute]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          
          <Logo onClick={() => handleNavigate('home')} />
          <SportTabs activeSport={activeSport} onChange={setActiveSport} />

          <div className="flex flex-1 justify-end items-center gap-3">
            <div className="hidden lg:block"><SearchButton onClick={() => setIsSearchOpen(true)} /></div>
            <ThemeToggle />
            
            {/* 🌟 電腦版使用者選單 */}
            <UserMenu onNavigate={handleNavigate} />

            {/* 手機版搜尋與漢堡選單 */}
            <div className="lg:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* 🌟 手機版選單 */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              className="border-t border-slate-800 bg-slate-900 px-6 py-4 lg:hidden flex flex-col gap-2 shadow-2xl absolute w-full left-0 top-16"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 no-scrollbar">
                {sportOptions.map((s) => (
                  <Button
                    key={s.value} variant={activeSport === s.value ? 'secondary' : 'ghost'}
                    className={`flex-none ${activeSport === s.value ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                    onClick={() => { setActiveSport(s.value); setMobileOpen(false); }}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
              
              <div className="h-px bg-slate-800 my-2" />
              
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-slate-800/50 rounded-lg mb-4 text-sm text-slate-300 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                    </div>
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                  <Button className="w-full justify-start bg-slate-800 text-white hover:bg-slate-700" onClick={() => handleNavigate('dashboard')}>
                    <Layout className="mr-2 h-4 w-4 text-orange-400" /> 主控台 (主辦方)
                  </Button>
                  <Button className="w-full justify-start bg-slate-800 text-white hover:bg-slate-700" onClick={() => handleNavigate('member')}>
                    <User className="mr-2 h-4 w-4 text-blue-400" /> 會員中心 (管理隊伍)
                  </Button>
                  <Button className="w-full justify-start bg-slate-800 text-white hover:bg-slate-700" onClick={() => handleNavigate('wizard')}>
                    <Globe className="mr-2 h-4 w-4 text-emerald-400" /> 建立新賽事
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-700 text-red-400 hover:bg-red-950/30 mt-4" onClick={async () => { await logout(); handleNavigate('home'); }}>
                    <LogOut className="mr-2 h-4 w-4" /> 登出
                  </Button>
                </div>
              ) : (
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-lg font-bold shadow-lg" onClick={() => handleNavigate('login')}>
                  <LogIn className="mr-2 h-5 w-5" /> 立即登入 / 註冊
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelect={onSearchSelect} />
    </>
  );
});