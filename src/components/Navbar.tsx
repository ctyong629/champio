import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Share2, Users, Layout, LogIn, Menu, X, 
  Shield, ChevronDown, CheckCircle2, Search, Command,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchModal } from './SearchModal';
import { ThemeToggle } from './ThemeProvider';
import type { UserRole, SportType } from '@/types';
import type { RouteType } from '@/App';

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

const roleOptions: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin', label: '平台管理員', color: 'bg-red-500 text-white' },
  { value: 'organizer', label: '主辦方', color: 'bg-orange-500 text-white' },
  { value: 'captain', label: '隊長', color: 'bg-emerald-500 text-white' },
  { value: 'scorekeeper', label: '記錄台人員', color: 'bg-blue-500 text-white' },
  { value: 'viewer', label: '一般瀏覽者', color: 'bg-slate-700 text-slate-300' },
];

// ============================================
// Types
// ============================================

interface NavbarProps {
  route: string;
  setRoute: (route: RouteType) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  onSearchSelect: (type: string, id: number) => void;
}

// ============================================
// Components
// ============================================

const Logo = memo(function Logo({ onClick }: { onClick: () => void }) {
  return (
    <motion.div 
      className="flex items-center gap-2 cursor-pointer group" 
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img 
        src="/champio-logo.png" 
        alt="Champio" 
        className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" 
      />
      <span className="font-display text-2xl tracking-widest text-white group-hover:text-orange-400 transition-colors mt-1">
        CHAMPIO
      </span>
    </motion.div>
  );
});

const SportTabs = memo(function SportTabs({ 
  activeSport, 
  onChange 
}: { 
  activeSport: SportType; 
  onChange: (sport: SportType) => void;
}) {
  return (
    <div className="hidden items-center gap-1 md:flex">
      {sportOptions.map((s) => (
        <button
          key={s.value}
          className={`
            relative px-4 py-2 text-sm font-medium transition-colors
            ${activeSport === s.value ? 'text-white' : 'text-slate-400 hover:text-white'}
          `}
          onClick={() => onChange(s.value)}
        >
          {s.label}
          {activeSport === s.value && (
            <motion.div
              layoutId="activeSport"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Search className="w-4 h-4" />
      <span className="hidden lg:inline">搜尋...</span>
      <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-700 rounded text-xs">
        <Command className="w-3 h-3" />K
      </kbd>
    </motion.button>
  );
});

const RoleSwitcher = memo(function RoleSwitcher({ 
  role, 
  onChange 
}: { 
  role: UserRole; 
  onChange: (role: UserRole) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentRole = roleOptions.find((r) => r.value === role) || roleOptions[4];

  const handleSelect = useCallback((newRole: UserRole) => {
    onChange(newRole);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="gap-2 text-slate-300 hover:bg-slate-800 border border-slate-800 h-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Shield className="h-4 w-4 text-slate-400 hidden sm:block" />
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${currentRole.color}`}>
          {currentRole.label}
        </span>
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {roleOptions.map((r) => (
                <div 
                  key={r.value} 
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between text-sm transition-colors"
                  onClick={() => handleSelect(r.value)}
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.color}`}>{r.label}</span>
                  {role === r.value && <CheckCircle2 className="h-4 w-4 text-orange-500" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

const MobileMenu = memo(function MobileMenu({
  isOpen,
  onClose,
  activeSport,
  onSportChange,
  role,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  role: UserRole;
  onNavigate: (route: RouteType) => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="border-t border-slate-800 bg-slate-900 px-6 py-4 md:hidden flex flex-col gap-2 shadow-2xl"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        {sportOptions.map((s) => (
          <Button
            key={s.value}
            variant={activeSport === s.value ? 'secondary' : 'ghost'}
            className={`flex-none ${activeSport === s.value ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            onClick={() => { onSportChange(s.value); onClose(); }}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="h-px bg-slate-800 my-2" />
      {(role === 'organizer' || role === 'admin') && (
        <Button 
          className="justify-start w-full mb-2 bg-orange-500 hover:bg-orange-600" 
          onClick={() => { onNavigate('wizard'); onClose(); }}
        >
          <Globe className="mr-2 h-4 w-4" /> 建立官網
        </Button>
      )}
      <Button variant="ghost" className="justify-start w-full text-slate-300 mb-2">
        <Share2 className="mr-2 h-4 w-4" /> 比賽分享
      </Button>
      {(role === 'captain' || role === 'organizer' || role === 'admin') && (
        <Button variant="ghost" className="justify-start w-full text-slate-300 mb-2">
          <Users className="mr-2 h-4 w-4" /> 建立隊伍
        </Button>
      )}
      <Button variant="outline" className="justify-start w-full border-slate-700 text-slate-300">
        <LogIn className="mr-2 h-4 w-4" /> 登入 / 註冊
      </Button>
    </motion.div>
  );
});

// ============================================
// Main Navbar Component
// ============================================

export const Navbar = memo(function Navbar({
  route,
  setRoute,
  role,
  setRole,
  activeSport,
  setActiveSport,
  isSearchOpen,
  setIsSearchOpen,
  onSearchSelect,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = useCallback((newRoute: RouteType) => {
    setRoute(newRoute);
    setMobileOpen(false);
  }, [setRoute]);

  const handleRoleChange = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, [setRole]);

  const handleSportChange = useCallback((sport: SportType) => {
    setActiveSport(sport);
  }, [setActiveSport]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo onClick={() => handleNavigate('home')} />

          {/* Desktop nav - Sport tabs */}
          <SportTabs activeSport={activeSport} onChange={handleSportChange} />

          {/* CTA buttons (desktop) */}
          <div className="hidden items-center gap-2 lg:flex">
            {(role === 'organizer' || role === 'admin') && (
              <Button 
                className="h-9 px-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" 
                onClick={() => handleNavigate('wizard')}
              >
                <Globe className="mr-2 h-4 w-4" /> 建立官網
              </Button>
            )}
            
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <ThemeToggle />
            
            <Button variant="ghost" className="h-9 text-slate-300 hover:text-white hover:bg-slate-800">
              <Share2 className="mr-2 h-4 w-4" /> 比賽分享
            </Button>
            
            {(role === 'captain' || role === 'organizer' || role === 'admin') && (
              <Button variant="ghost" className="h-9 text-slate-300 hover:text-white hover:bg-slate-800">
                <Users className="mr-2 h-4 w-4" /> 建立隊伍
              </Button>
            )}
            
            {(role === 'organizer' || role === 'admin') && route !== 'dashboard' && (
              <>
                <div className="w-px h-5 bg-slate-700 mx-2" />
                <Button 
                  variant="outline" 
                  className="h-9 border-slate-700 hover:bg-slate-800" 
                  onClick={() => handleNavigate('dashboard')}
                >
                  <Layout className="mr-2 h-4 w-4" /> 主控台
                </Button>
              </>
            )}
          </div>

          {/* Right side: role switcher + login + mobile menu */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <SearchButton onClick={() => setIsSearchOpen(true)} />
            </div>
            
            <RoleSwitcher role={role} onChange={handleRoleChange} />
            
            <Button 
              variant="ghost" 
              className="hidden md:flex h-9 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => handleNavigate('member')}
            >
              <User className="mr-2 h-4 w-4" /> 會員中心
            </Button>
            
            <Button variant="outline" className="hidden md:flex h-9 border-slate-700 hover:bg-slate-800">
              <LogIn className="mr-2 h-4 w-4" /> 登入
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              className="md:hidden px-2 h-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <MobileMenu
              isOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
              activeSport={activeSport}
              onSportChange={handleSportChange}
              role={role}
              onNavigate={handleNavigate}
            />
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={onSearchSelect}
      />
    </>
  );
});
