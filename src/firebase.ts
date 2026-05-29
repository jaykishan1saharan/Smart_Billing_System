import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7OTgefYEgPVgNYgxo6pCV3E-aHfInl0M",
  authDomain: "smart-billing-system-94de8.firebaseapp.com",
  projectId: "smart-billing-system-94de8",
  storageBucket: "smart-billing-system-94de8.firebasestorage.app",
  messagingSenderId: "861537845876",
  appId: "1:861537845876:web:bf4b49087ef86c6fec0721"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();