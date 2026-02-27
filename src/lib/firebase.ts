import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 環境變數檢查
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
  console.warn('請確認 .env 檔案已設定，或環境變數已正確配置');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// 初始化 Firebase（如果配置不完整會有警告但不會崩潰）
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
    // 提供 mock 物件避免崩潰
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