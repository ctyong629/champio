import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db, firebaseInitialized } from '@/lib/firebase'; // 🌟 記得匯入 db 和初始化狀態
import { doc, getDoc } from 'firebase/firestore'; // 🌟 匯入 Firestore 方法

interface AuthContextType {
  currentUser: User | null; 
  userRole: string | null;  // 🌟 新增 userRole 欄位
  isLoading: boolean;       
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // 🌟 新增角色狀態
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果 Firebase 未初始化，顯示錯誤並結束 loading
    if (!firebaseInitialized) {
      console.error('❌ Firebase 未初始化，認證功能無法使用');
      setIsLoading(false);
      return;
    }

    // 把 callback 加上 async，因為我們要去資料庫抓資料
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // 🌟 登入成功後，去 Firestore 抓取使用者的 role
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().role) {
            setUserRole(docSnap.data().role);
          } else {
            // 如果是新用戶或沒設定過，預設給 captain (隊長)
            setUserRole('captain');
          }
        } catch (error) {
          console.error("抓取角色失敗:", error);
          setUserRole('captain');
        }
      } else {
        // 登出時清空
        setUserRole(null);
      }
      
      setIsLoading(false);
    });
    
    return unsubscribe; 
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, isLoading, logout }}>
      {/* 🌟 拔掉 !isLoading，讓 App.tsx 裡的 Loader2 轉圈圈動畫能順利顯示！ */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);