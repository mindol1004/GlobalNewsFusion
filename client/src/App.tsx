import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Bookmarks from "@/pages/Bookmarks";
import Category from "@/pages/Category";
import Search from "@/pages/Search";
import { useState, useEffect } from "react";
import { loginWithEmail, loginWithGoogle, registerWithEmail, logout } from "./lib/auth-helpers";
import { useToast } from "./hooks/use-toast";
import { useAuth } from "./hooks/useAuth";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile">
        {user ? <Profile /> : <Home />}
      </Route>
      <Route path="/bookmarks">
        {user ? <Bookmarks /> : <Home />}
      </Route>
      <Route path="/category/:category" component={Category} />
      <Route path="/search" component={Search} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { toast } = useToast();

  // 로그인 상태 디버깅을 위한 useEffect
  useEffect(() => {
    console.log("App.tsx - Current auth state:", { 
      isLoggedIn: !!user, 
      isLoading, 
      userInfo: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null
    });
  }, [user, isLoading]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginWithEmail(email, password);
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      setIsLoginModalOpen(false);
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "로그인 성공",
        description: "Google 계정으로 로그인되었습니다.",
      });
      setIsLoginModalOpen(false);
      setIsSignupModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Google 로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    try {
      await registerWithEmail(email, password, displayName);
      toast({
        title: "회원가입 성공",
        description: `환영합니다, ${displayName}님!`,
      });
      setIsSignupModalOpen(false);
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "로그아웃 성공",
        description: "다음에 또 만나요!",
      });
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
        <Header 
          user={user}
          isLoading={isLoading}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
          onLogoutClick={handleLogout}
        />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <MobileNavigation />
        <Toaster />
        
        {/* 로그인 모달 */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
        />
        
        {/* 회원가입 모달 */}
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onSignup={handleRegister}
          onGoogleLogin={handleGoogleLogin}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;