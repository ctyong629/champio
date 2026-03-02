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

// Firebase 核心配置 (這裡只呼叫變數名稱，不放真實金鑰)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
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

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.warn('⚠️ Firebase 未初始化：缺少必要配置');
    auth = { currentUser: null, onAuthStateChanged: () => () => {} };
    db = {};
    storage = {};
  }
} catch (error) {
  console.error('❌ Firebase 初始化失敗:', error);
  auth = { currentUser: null, onAuthStateChanged: () => () => {} };
  db = {};
  storage = {};
}

export { auth, db, storage };