import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// 1. Pehle App initialize hoga (Sabse important)
const app = initializeApp(firebaseConfig);

// 2. Ab 'app' use karne waale saare services iske niche initialize honge
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app); // ✅ Fixed: Ab 'app' pehle se available hai

// ── Providers & Methods ──────────────────────────────────────────────────────

// Google
const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

// Apple
const appleProvider = new OAuthProvider("apple.com");
export const loginWithApple = () => signInWithPopup(auth, appleProvider);

// Email/Password
export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);