import { useLocation } from "wouter";

/**
 * Simple utility function to check if a user is authenticated
 * using the presence of an auth token in localStorage
 */
export function isUserAuthenticated(): boolean {
  return localStorage.getItem("authToken") !== null;
}

/**
 * Simple utility to sign out a user by removing their auth token
 * and redirecting to the home page
 */
export function signOutUser() {
  localStorage.removeItem("authToken");
  window.location.href = "/";
}

/**
 * Hook that redirects to home page if user is not authenticated
 * @returns boolean indicating if the user is authenticated
 */
export function useRequireAuth(): boolean {
  const [, setLocation] = useLocation();
  const isAuthenticated = isUserAuthenticated();

  if (!isAuthenticated) {
    setLocation("/");
    return false;
  }

  return true;
}