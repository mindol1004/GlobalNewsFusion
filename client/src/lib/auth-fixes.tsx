import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

/**
 * Simple utility function to check if a user is authenticated
 * using Firebase auth state
 */
export function isUserAuthenticated(): boolean {
  const { user } = useAuth();
  return !!user;
}

/**
 * Simple utility to sign out a user
 */
export function signOutUser() {
  // 최신 버전에서는 useAuth 훅에서 직접 signOut을 사용하는 것이 좋습니다.
}

/**
 * Hook that redirects to home page if user is not authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function useRequireAuth(): boolean {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  if (!user) {
    console.log("User not authenticated, redirecting to home");
    setLocation("/");
    return false;
  }

  return true;
}