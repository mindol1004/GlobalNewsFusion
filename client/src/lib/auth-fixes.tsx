import { useLocation } from "wouter";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Simple utility function to check if a user is authenticated
 * using Firebase auth state
 */
export function isUserAuthenticated(): boolean {
  const authContext = useAuthContext();
  return authContext.isAuthenticated;
}

/**
 * Simple utility to sign out a user
 */
export function signOutUser() {
  const authContext = useAuthContext();
  authContext.signOut();
}

/**
 * Hook that redirects to home page if user is not authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function useRequireAuth(): boolean {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to home");
    setLocation("/");
    return false;
  }

  return true;
}