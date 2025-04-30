import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Log the environment variables for debugging
console.log("Firebase env variables:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "exists" : "missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "exists" : "missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "exists" : "missing"
});

// Initialize Firebase with fallback values for development if environment variables are not available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: "HIDDEN" });

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Set persistence to LOCAL to keep user logged in (browser session)
import { setPersistence, browserLocalPersistence } from "firebase/auth";
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize database
const database = getDatabase(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Export Firebase services
export { firebaseApp, auth, database, googleProvider };
