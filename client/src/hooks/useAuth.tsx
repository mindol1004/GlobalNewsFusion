import { useState } from "react";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from "firebase/auth";
import { firebaseApp, googleProvider } from "../lib/firebase";
import { useAuthContext } from "../contexts/AuthContext";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "./use-toast";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(firebaseApp);
  const authContext = useAuthContext();
  const { currentUser, userProfile, isAuthenticated, isInitializing, signOut } = authContext;
  const { toast } = useToast();
  
  console.log("useAuth hook called, current state:", {
    isAuthenticated,
    userProfile: userProfile ? "exists" : "null",
    isInitializing
  });
  
  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (result.user) {
        await updateProfile(result.user, { displayName });
        
        try {
          // Create user profile in our backend
          await apiRequest("POST", "/api/user/register", {
            email,
            displayName,
            firebaseId: result.user.uid,
            username: email.split('@')[0], // Use part of email as username
          });
          
          toast({
            title: "Account created",
            description: `Welcome to GlobalNews, ${displayName}!`,
          });
        } catch (apiError) {
          console.error("Error registering user with backend:", apiError);
          // Continue anyway since Firebase auth succeeded
          toast({
            title: "Account created",
            description: "Your account was created but profile setup is incomplete. Some features may be limited.",
            variant: "destructive",
          });
        }
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      // Attempt to sign in
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Handle successful login
      if (result.user) {
        try {
          // Register user in backend to make sure profile is created
          try {
            await apiRequest("POST", "/api/user/register", {
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              firebaseId: result.user.uid,
              username: result.user.email?.split('@')[0] || `user_${Date.now()}`,
            });
            
            // Get user profile to update UI
            const profileResponse = await apiRequest("GET", "/api/user/profile");
            const profile = await profileResponse.json();
            console.log("Profile fetched after login:", profile);
            
            toast({
              title: "Login successful",
              description: "Welcome back, " + (profile.displayName || profile.username || email),
            });
          } catch (apiError) {
            console.error("Backend API error:", apiError);
            toast({
              title: "Login successful",
              description: "You are now logged in with limited functionality",
            });
          }
        } catch (tokenError) {
          console.error("Error getting user token:", tokenError);
          toast({
            title: "Login partially successful",
            description: "Logged in but couldn't get authentication token",
          });
        }
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGoogle = async (): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user profile in our backend
      if (result.user) {
        try {
          // Create or update user profile in our backend
          await apiRequest("POST", "/api/user/register", {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            firebaseId: result.user.uid,
            username: result.user.email?.split('@')[0] || `user_${Date.now()}`, // Use part of email as username
          });
          
          toast({
            title: "Login successful",
            description: "You are now logged in with Google",
          });
        } catch (apiError) {
          console.error("Error creating user profile:", apiError);
          // Continue anyway since Firebase auth succeeded
        }
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user: currentUser,
    userProfile,
    isAuthenticated,
    isInitializing,
    isLoading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    resetPassword,
    signOut,
  };
}