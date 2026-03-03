import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 環境變數檢查：確認 Vite 有沒有成功讀取到 .env.local
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingVars.length > 0) {
  console.warn('⚠️ 缺少 Firebase 環境變數:', missingVars);
  console.warn('請確認 .env.local 檔案已設定，並且有重啟開發伺服器！');
}

// Firebase 核心配置
// 注意：這是臨時硬編碼配置，僅用於測試。生產環境應使用環境變數
const firebaseConfig = {
  apiKey: 'AIzaSyBgcUHw7wBaRk9n-Uk4PoNr4C7AG8VIuxg',
  authDomain: 'champio-325a8.firebaseapp.com',
  projectId: 'champio-325a8',
  storageBucket: 'champio-325a8.firebasestorage.app',
  messagingSenderId: '250634726028',
  appId: '1:250634726028:web:507ea35e119a3861c9e9a9'
};

// 調試：確認環境變數是否讀取成功（只顯示前5個字符，保護安全）
if (import.meta.env.DEV) {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  console.log("🔧 Firebase API Key 狀態:", apiKey ? `已載入 (${apiKey.substring(0, 5)}...)` : "未載入");
}

// 初始化 Firebase
let app;
let auth: any;
let db: any;
let storage: any;
let firebaseInitialized = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    firebaseInitialized = true;
    console.log('✅ Firebase 初始化成功');
  } else {
    const errorMsg = '❌ Firebase 未初始化：缺少必要環境變數。請確認已設定 .env.local 檔案（本地開發）或 GitHub Secrets（部署）';
    console.error(errorMsg);
    console.error('缺失變數:', missingVars.join(', '));
    
    // 創建一個會明確報錯的佔位對象，而不是靜默失敗
    const throwError = () => { 
      throw new Error('Firebase 未初始化，無法執行認證操作。請檢查環境變數設定。'); 
    };
    
    auth = {
      currentUser: null,
      onAuthStateChanged: () => { 
        console.error('⚠️ Firebase Auth 未初始化，監聽功能無法使用');
        return () => {}; 
      },
      signInWithEmailAndPassword: throwError,
      createUserWithEmailAndPassword: throwError,
      signOut: throwError,
      sendPasswordResetEmail: throwError,
    };
    
    db = new Proxy({}, {
      get: () => throwError
    });
    
    storage = new Proxy({}, {
      get: () => throwError
    });
  }
} catch (error) {
  console.error('❌ Firebase 初始化失敗:', error);
  const throwError = () => { 
    throw new Error('Firebase 初始化失敗: ' + (error as Error).message); 
  };
  
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: throwError,
    createUserWithEmailAndPassword: throwError,
    signOut: throwError,
    sendPasswordResetEmail: throwError,
  };
  db = new Proxy({}, { get: () => throwError });
  storage = new Proxy({}, { get: () => throwError });
}

export { auth, db, storage, firebaseInitialized };