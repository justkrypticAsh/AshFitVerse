 import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
// 1. Firestore import add kijiye
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 2. Database (Firestore) ko initialize karke export kijiye
export const db = getFirestore(app); 

// --- Baki aapka code bilkul same hai, maine kuch nahi badla ---

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