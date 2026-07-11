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
  apiKey: "AIzaSyDRMKSQpsFN3moNMzbtW9HT6QzChZT1IdA",
  authDomain: "ashfitverse.firebaseapp.com",
  projectId: "ashfitverse",
  storageBucket: "ashfitverse.firebasestorage.app",
  messagingSenderId: "1005404951754",
  appId: "1:1005404951754:web:505d4e79ee50566c075033",
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