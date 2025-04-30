import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Bookmarks from "@/pages/Bookmarks";
import Category from "@/pages/Category";
import Search from "@/pages/Search";
import { useAuth } from "./hooks/useAuth";
import LoginModal from "./components/Auth/LoginModal";
import SignupModal from "./components/Auth/SignupModal";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/bookmarks" component={Bookmarks} />
      <Route path="/category/:category" component={Category} />
      <Route path="/search" component={Search} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isInitializing, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // This will force a re-render when auth state changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [isAuthenticated]);

  console.log("App component rendering, isInitializing:", isInitializing);

  if (isInitializing) {
    console.log("App is in initializing state, showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("App initialization complete, rendering main content");

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
        <Header 
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
        />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <MobileNavigation />
        <Toaster />
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
          onSignupClick={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
        <SignupModal 
          isOpen={isSignupModalOpen} 
          onClose={() => setIsSignupModalOpen(false)}
          onLoginClick={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;
