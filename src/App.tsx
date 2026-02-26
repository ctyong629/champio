import { useState, useEffect, useCallback, memo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // 引入路由套件
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import { PageTransition } from '@/components/PageTransition';
import { LandingPage } from '@/pages/LandingPage';
import { EventWizard } from '@/pages/EventWizard';
import { Dashboard } from '@/pages/Dashboard';
import { PublicEventPage } from '@/pages/PublicEventPage';
import { ScorekeeperApp } from '@/pages/ScorekeeperApp';
import { MemberCenter } from '@/pages/MemberCenter';
import { NotFound } from '@/pages/NotFound';
import { useSearchShortcut } from '@/hooks/useKeyboard';
import './App.css';
import type { UserRole, SportType } from '@/types';

// ============================================
// Main App Component
// ============================================

export type RouteType = 'home' | 'wizard' | 'dashboard' | 'member' | 'public_event' | 'scorekeeper' | 'not_found';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 根據當前的 URL 路徑，反推對應的 RouteType (為了相容 Navbar 和 PageTransition)
  const getRouteFromPath = (): RouteType => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/wizard') return 'wizard';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/member') return 'member';
    if (path === '/event') return 'public_event';
    if (path === '/scorekeeper') return 'scorekeeper';
    return 'not_found';
  };

  const route = getRouteFromPath();
  
  // 建立一個假的 setRoute 來相容你原本寫好的子元件
  // 這樣底下頁面的按鈕按下去時，就會觸發真實的 URL 跳轉！
  const setRoute = useCallback((newRoute: RouteType) => {
    const paths: Record<RouteType, string> = {
      home: '/',
      wizard: '/wizard',
      dashboard: '/dashboard',
      member: '/member',
      public_event: '/event',
      scorekeeper: '/scorekeeper',
      not_found: '/404',
    };
    navigate(paths[newRoute] || '/404');
  }, [navigate]);

  // Role state
  const [role, setRole] = useState<UserRole>('viewer');
  
  // Active sport filter
  const [activeSport, setActiveSport] = useState<SportType>('basketball');
  
  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  useSearchShortcut(() => setIsSearchOpen(true));

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]); // 改為監聽 pathname 變化

  // Set document title based on route
  useEffect(() => {
    const titles: Record<RouteType, string> = {
      home: 'Champio — 專業運動賽事管理平台',
      wizard: '建立賽事官網 — Champio',
      dashboard: '賽事主控台 — Champio',
      member: '會員中心 — Champio',
      public_event: '2026 全國春季盃籃球聯賽 — Champio',
      scorekeeper: '記錄台 — Champio',
      not_found: '頁面不存在 — Champio',
    };
    document.title = titles[route] || 'Champio';
  }, [route]);

  // Handle search result selection
  const handleSearchSelect = useCallback((_type: string, _id: number) => {
    switch (_type) {
      case 'event':
        setRoute('public_event');
        break;
      case 'team':
        setRoute('dashboard');
        break;
      case 'announcement':
        setRoute('public_event');
        break;
    }
  }, [setRoute]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-orange-500/30">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-display { font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.05em; }
      `}</style>

      {/* Navbar - hidden in scorekeeper mode */}
      {route !== 'scorekeeper' && (
        <Navbar 
          route={route}
          setRoute={setRoute}
          role={role}
          setRole={setRole}
          activeSport={activeSport}
          setActiveSport={setActiveSport}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          onSearchSelect={handleSearchSelect}
        />
      )}

      {/* Main content with page transitions and React Router Routes */}
      <main>
        <PageTransition route={route}>
          <Routes>
            <Route path="/" element={<LandingPage setRoute={setRoute} role={role} />} />
            <Route path="/wizard" element={<EventWizard setRoute={setRoute} />} />
            <Route path="/dashboard" element={<Dashboard setRoute={setRoute} />} />
            <Route path="/member" element={<MemberCenter setRoute={setRoute} role={role} />} />
            <Route path="/event" element={<PublicEventPage setRoute={setRoute} role={role} />} />
            <Route path="/scorekeeper" element={<ScorekeeperApp setRoute={setRoute} />} />
            <Route path="*" element={<NotFound setRoute={setRoute} />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}

// Wrap with providers
function App() {
  return (
    <ToastProvider>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default memo(App);