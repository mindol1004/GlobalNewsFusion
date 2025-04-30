import { useAuthContext } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// Define props for the protected route
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  // Create a wrapper component that contains all our logic
  const ProtectedWrapper = () => {
    const { isAuthenticated, isInitializing } = useAuthContext();
    const { toast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // Check authentication and redirect if needed
    useEffect(() => {
      if (!isInitializing && !isAuthenticated) {
        console.log("User not authenticated, redirecting to home");
        
        toast({
          title: "Authentication required",
          description: "Please sign in to view this page.",
          variant: "destructive",
        });
        
        setIsRedirecting(true);
      }
    }, [isInitializing, isAuthenticated, toast]);
    
    // Show loading spinner while checking authentication
    if (isInitializing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Redirect if not authenticated
    if (!isAuthenticated || isRedirecting) {
      return <Redirect to="/" />;
    }
    
    // User is authenticated, render the protected component
    return <Component />;
  };
  
  // Return route with our wrapper component
  return <Route path={path} component={ProtectedWrapper} />;
}