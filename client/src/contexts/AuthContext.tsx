import { createContext, useEffect, useState, useContext } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { auth as firebaseAuth } from "../lib/firebase";
import { apiRequest } from "../lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAuthenticated: false,
  isInitializing: false, // Changed default to false so app doesn't get stuck
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  console.log("AuthProvider initializing");
  
  useEffect(() => {
    console.log("Setting up auth state listener");
    let hasCompletedInitialCheck = false;
    
    // Set a timeout to force-exit initialization state after a reasonable time
    const initTimeout = setTimeout(() => {
      if (!hasCompletedInitialCheck) {
        console.log("Auth initialization timed out, forcing completion");
        setIsInitializing(false);
        hasCompletedInitialCheck = true;
      }
    }, 3000);
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      console.log("Auth state changed, user:", user ? "exists" : "null");
      setCurrentUser(user);
      
      if (user) {
        try {
          // Firebase persistence should be set to LOCAL in firebase.ts
          console.log("Firebase persistence set to LOCAL");
          
          try {
            // Create or update user in our backend if needed
            await apiRequest("POST", "/api/user/register", {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              firebaseId: user.uid,
              username: user.email?.split('@')[0] || `user_${Date.now()}`,
            });
            
            console.log("User registered or updated in backend");
            
            // Now fetch user profile from our backend
            const response = await apiRequest("GET", "/api/user/profile");
            const profile = await response.json();
            console.log("Profile fetched:", profile);
            setUserProfile(profile);
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // Continue without profile if api fails
          }
        } catch (error) {
          console.error("Error during auth setup:", error);
        }
      } else {
        // Clear auth data when user is null
        setUserProfile(null);
      }
      
      // Mark initialization as complete
      if (!hasCompletedInitialCheck) {
        console.log("Auth initialization complete");
        setIsInitializing(false);
        hasCompletedInitialCheck = true;
        clearTimeout(initTimeout);
      }
    }, (error) => {
      // Handle auth observer error
      console.error("Auth state observer error:", error);
      
      if (!hasCompletedInitialCheck) {
        setIsInitializing(false);
        hasCompletedInitialCheck = true;
        clearTimeout(initTimeout);
      }
    });
    
    return () => {
      unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []); 
  
  const signOut = async () => {
    console.log("AuthContext: Signing out user");
    try {
      // Sign out from Firebase
      await firebaseSignOut(firebaseAuth);
      
      // Clear state
      setCurrentUser(null);
      setUserProfile(null);
      
      // Force page refresh to clear all states
      console.log("AuthContext: Sign out successful, redirecting to home");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback if Firebase signout fails
      setCurrentUser(null);
      setUserProfile(null);
      window.location.href = "/";
    }
  };
  
  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    isInitializing,
    signOut,
  };
  
  console.log("AuthProvider rendering, isInitializing:", isInitializing);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  return context;
}