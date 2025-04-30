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
  const { currentUser, userProfile, isAuthenticated, isInitializing, signOut } = useAuthContext();
  const { toast } = useToast();
  
  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (result.user) {
        await updateProfile(result.user, { displayName });
        
        try {
          // Get the token for the newly created user
          const token = await result.user.getIdToken();
          
          // Create user profile in our backend
          await apiRequest("POST", "/api/user/register", {
            email,
            displayName,
            firebaseId: result.user.uid,
            username: email.split('@')[0], // Use part of email as username
          }, token);
          
          // Store auth token for subsequent requests
          localStorage.setItem("authToken", token);
          
          // Force refresh the page to update authentication state
          window.location.reload();
        } catch (apiError) {
          console.error("Error registering user with backend:", apiError);
          // Continue anyway since Firebase auth succeeded
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
      return await signInWithEmailAndPassword(auth, email, password);
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
        await apiRequest("POST", "/api/user/register", {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          firebaseId: result.user.uid,
        });
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
