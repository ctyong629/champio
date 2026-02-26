import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 🌟 新增 Storage 模組

const firebaseConfig = {
  apiKey: "AIzaSyBgcUHw7wBaRk9n-Uk4PoNr4C7AG8VIuxg",
  authDomain: "champio-325a8.firebaseapp.com",
  projectId: "champio-325a8",
  storageBucket: "champio-325a8.firebasestorage.app",
  messagingSenderId: "250634726028",
  appId: "1:250634726028:web:507ea35e119a3861c9e9a9"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出實例給整個專案使用
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 🌟 匯出 Storage