import { createContext, useEffect, useState, useContext } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onIdTokenChanged
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
  isInitializing: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  console.log("AuthProvider initializing");

  // Listen for auth state changes (user sign in/out)
  useEffect(() => {
    let hasCompletedInitialCheck = false;
    const initTimeout = setTimeout(() => {
      if (!hasCompletedInitialCheck) {
        console.log("Auth initialization timed out");
        setIsInitializing(false);
        hasCompletedInitialCheck = true;
      }
    }, 3000);

    // This listens for token changes which is more reliable
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (user) => {
      console.log("Auth token changed, user:", user ? "exists" : "null");
      setCurrentUser(user);
      
      if (user) {
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
        } catch (error) {
          console.error("Error during profile setup:", error);
        }
      } else {
        // Clear user profile when signing out
        setUserProfile(null);
      }
      
      // Mark initialization as complete
      if (!hasCompletedInitialCheck) {
        console.log("Auth initialization complete");
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
    console.log("Signing out user");
    try {
      await firebaseSignOut(firebaseAuth);
      // The auth state listener will handle the rest
    } catch (error) {
      console.error("Error signing out:", error);
      setCurrentUser(null);
      setUserProfile(null);
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
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}