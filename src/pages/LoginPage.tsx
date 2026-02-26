import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';

// 引入 Firebase 驗證功能
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // 執行 Firebase 登入
        await signInWithEmailAndPassword(auth, email, password);
        addToast({ title: '登入成功！歡迎回來。', variant: 'success' });
      } else {
        // 執行 Firebase 註冊
        await createUserWithEmailAndPassword(auth, email, password);
        addToast({ title: '註冊成功！已為您建立帳號。', variant: 'success' });
      }
      
      // 成功後跳轉到會員中心
      navigate('/member');
      
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMessage = '發生錯誤，請稍後再試。';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '這個電子郵件已經被註冊過了。';
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = '帳號或密碼錯誤，請重新輸入。';
          break;
        case 'auth/weak-password':
          errorMessage = '密碼強度太弱，請至少輸入 6 個字元。';
          break;
      }
      
      addToast({ title: errorMessage, variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 忘記密碼處理函式
  const handleForgotPassword = async () => {
    if (!email) {
      addToast({ title: '請先在上方輸入您的電子郵件', variant: 'warning' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      addToast({ 
        title: '重設密碼信件已發出！', 
        description: '請至信箱點擊連結以重設密碼。', 
        variant: 'success' 
      });
    } catch (error: any) {
      addToast({ 
        title: '發送失敗', 
        description: error.code === 'auth/user-not-found' ? '找不到此信箱' : '請稍後再試', 
        variant: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo 區塊 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wider">
            CHAMPIO
          </h1>
          <p className="text-slate-400 mt-2">專業運動賽事管理平台</p>
        </div>

        <Card className="p-8 bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? '歡迎回來' : '建立新帳號'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {isLogin ? '請輸入您的電子郵件與密碼登入' : '加入我們，開始管理您的專屬賽事'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">電子郵件</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 bg-slate-950 border-slate-800 text-white focus:border-orange-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300">密碼</Label>
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-xs text-orange-500 hover:text-orange-400"
                      >
                        忘記密碼？
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 bg-slate-950 border-slate-800 text-white focus:border-orange-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? '登入' : '註冊'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                {isLogin ? '還沒有帳號嗎？' : '已經有帳號了？'}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
                >
                  {isLogin ? '立即註冊' : '登入帳號'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}