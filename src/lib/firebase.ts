import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;

  const firebaseConfig = {
    apiKey: "AIzaSyCwjeLijCB4-HfFbJjHrpfocJ5mn39pat0",
    authDomain: "nexusapp-c0a21.firebaseapp.com",
    databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nexusapp-c0a21",
    storageBucket: "nexusapp-c0a21.firebasestorage.app",
    messagingSenderId: "487113661451",
    appId: "1:487113661451:web:1774402530bfd189c6fb0e",
    measurementId: "G-TQ7GDCG5QX"
  };

  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key missing. Please set VITE_FIREBASE_API_KEY in your environment.");
  }

  appInstance = initializeApp(firebaseConfig);
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export const googleProvider = new GoogleAuthProvider();
