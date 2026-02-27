import { EventDashboard } from './pages/EventDashboard'; 
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback, memo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import { PageTransition } from '@/components/PageTransition';
import { LandingPage } from '@/pages/LandingPage';
import { EventWizard } from '@/pages/EventWizard';
import { PublicEventPage } from '@/pages/PublicEventPage';
import { ScorekeeperApp } from '@/pages/ScorekeeperApp';
import { MemberCenter } from '@/pages/MemberCenter';
import { NotFound } from '@/pages/NotFound';
import { LoginPage } from '@/pages/LoginPage';
import { useSearchShortcut } from '@/hooks/useKeyboard';
import { Loader2 } from 'lucide-react';
import './App.css';
import type { SportType } from '@/types'; 

// ============================================
// Protected Route Component (路由守衛)
// ============================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ============================================
// Main App Component
// ============================================

export type RouteType = 'home' | 'wizard' | 'dashboard' | 'member' | 'public_event' | 'scorekeeper' | 'not_found' | 'login';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getRouteFromPath = (): RouteType => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/wizard') return 'wizard';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/member') return 'member';
    if (path === '/event') return 'public_event';
    if (path === '/scorekeeper') return 'scorekeeper';
    if (path === '/login') return 'login';
    return 'not_found';
  };

  const route = getRouteFromPath();
  
  const setRoute = useCallback((newRoute: RouteType) => {
    const paths: Record<RouteType, string> = {
      home: '/',
      wizard: '/wizard',
      dashboard: '/dashboard',
      member: '/member',
      public_event: '/event',
      scorekeeper: '/scorekeeper',
      not_found: '/404',
      login: '/login', 
    };
    navigate(paths[newRoute] || '/404');
  }, [navigate]);

  const [activeSport, setActiveSport] = useState<SportType>('basketball');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useSearchShortcut(() => setIsSearchOpen(true));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // 🌟 修正後的動態標題邏輯
  useEffect(() => {
    const titles: Record<RouteType, string> = {
      home: 'Champio — 專業運動賽事管理平台',
      wizard: '建立賽事官網 — Champio',
      dashboard: '賽事主控台 — Champio',
      member: '會員中心 — Champio',
      public_event: '2026 全國春季盃籃球聯賽 — Champio',
      scorekeeper: '記錄台 — Champio',
      not_found: '頁面不存在 — Champio',
      login: '登入 — Champio', 
    };
    document.title = titles[route] || 'Champio | 讓賽事管理變得簡單';
  }, [route]);

  const handleSearchSelect = useCallback((_type: string, _id: string | number) => {
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-display { font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.05em; }
      `}</style>

      {route !== 'scorekeeper' && route !== 'dashboard' && (
        <Navbar 
          setRoute={setRoute}
          activeSport={activeSport}
          setActiveSport={setActiveSport}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          onSearchSelect={handleSearchSelect}
        />
      )}

      <main>
        <PageTransition route={route}>
          <Routes>
            <Route path="/" element={<LandingPage setRoute={setRoute} activeSport={activeSport} />} />
            <Route path="/wizard" element={<ProtectedRoute><EventWizard setRoute={setRoute} /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><EventDashboard setRoute={setRoute} /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute><MemberCenter setRoute={setRoute} /></ProtectedRoute>} />
            <Route path="/event" element={<PublicEventPage setRoute={setRoute} />} />
            <Route path="/scorekeeper" element={<ScorekeeperApp setRoute={setRoute} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound setRoute={setRoute} />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default memo(App);