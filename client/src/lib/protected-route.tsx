import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Define props for the protected route
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  // Just create a wrapper component that contains all our logic
  const ProtectedWrapper = () => {
    const { isAuthenticated, isInitializing } = useAuth();
    const hasToken = localStorage.getItem("authToken") !== null;
    
    // Show loading spinner while checking authentication
    if (isInitializing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Check if user is authenticated or has a token
    if (!isAuthenticated && !hasToken) {
      console.log("User not authenticated, redirecting to home");
      return <Redirect to="/" />;
    }
    
    // User is authenticated, render the protected component
    return <Component />;
  };
  
  // Return route with our wrapper component
  return <Route path={path} component={ProtectedWrapper} />;
}