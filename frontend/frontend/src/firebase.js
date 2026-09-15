import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
export const storage = getStorage(app);

// ── Providers & Methods ──────────────────────────────────────────────────────

// Google Provider configuration
export const googleProvider = new GoogleAuthProvider();
// Force account chooser so users can pick account cleanly
googleProvider.setCustomParameters({ prompt: "select_account" });

// Google Sign-In with automatic redirect fallback if popup is blocked
export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    // If popup is blocked by browser or environment, fallback to redirect
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.warn("Popup blocked or cancelled, attempting redirect sign-in...", error);
      return await signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const loginWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const getRedirectResultAuth = () => getRedirectResult(auth);

// Email / Password
export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const logoutUser = () => signOut(auth);