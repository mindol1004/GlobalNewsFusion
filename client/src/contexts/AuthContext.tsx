import { createContext, useEffect, useState, useContext } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { firebaseApp } from "../lib/firebase";
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
  const auth = getAuth(firebaseApp);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed", user);
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get the user's token for authentication with our backend
          const token = await user.getIdToken();
          
          // Store the token in localStorage for later use
          localStorage.setItem("authToken", token);
          
          try {
            // Fetch user profile from our backend
            const response = await apiRequest("GET", "/api/user/profile");
            const profile = await response.json();
            setUserProfile(profile);
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // Continue without profile if api fails
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      } else {
        localStorage.removeItem("authToken");
        setUserProfile(null);
      }
      
      // Always set initializing to false, even if there are errors
      setIsInitializing(false);
    }, (error) => {
      // Handle auth observer error
      console.error("Auth state observer error:", error);
      setIsInitializing(false);
    });
    
    // Set a timeout to prevent infinite loading if Firebase auth takes too long
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 5000);
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [auth]);
  
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("authToken");
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    isInitializing,
    signOut,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
