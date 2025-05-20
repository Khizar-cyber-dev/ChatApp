import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgbpDpI8JzTPLPyx_V4zBTmnPXtgCUp44",
  authDomain: "chatapp-4beb6.firebaseapp.com",
  projectId: "chatapp-4beb6",
  storageBucket: "chatapp-4beb6.firebasestorage.app",
  messagingSenderId: "783428262943",
  appId: "1:783428262943:web:6347743a2143f21a22092a",
  measurementId: "G-WMMH0WZKWZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);