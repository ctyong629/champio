import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 🌟 新增 Storage 模組

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // 🌟 改成這樣
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出實例給整個專案使用
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 🌟 匯出 Storage