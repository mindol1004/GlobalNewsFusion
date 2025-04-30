import { useAuth } from "../contexts/AuthContext";
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
    const { user, isLoading } = useAuth();
    const { toast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // Check authentication and redirect if needed
    useEffect(() => {
      if (!isLoading && !user) {
        console.log("User not authenticated, redirecting to home");
        
        toast({
          title: "Authentication required",
          description: "Please sign in to view this page.",
          variant: "destructive",
        });
        
        setIsRedirecting(true);
      }
    }, [isLoading, user, toast]);
    
    // Show loading spinner while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // Redirect if not authenticated
    if (!user || isRedirecting) {
      return <Redirect to="/" />;
    }
    
    // User is authenticated, render the protected component
    return <Component />;
  };
  
  // Return route with our wrapper component
  return <Route path={path} component={ProtectedWrapper} />;
}