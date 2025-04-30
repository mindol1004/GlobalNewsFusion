import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { loginWithEmail, loginWithGoogle, resetPassword, isLoading } = useAuth();
  const { toast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Attempting login with email:", email);
      await loginWithEmail(email, password);
      
      // Login success is handled in the useAuth hook with toasts
      onClose();
    } catch (error) {
      console.error("Login error in modal:", error);
      // Error is handled in the useAuth hook
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      onClose();
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await resetPassword(email);
      // Success message is handled in the useAuth hook
      setIsResetPassword(false);
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple-lg dark:shadow-apple-dark-md max-w-md w-full mx-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold dark:text-white">
            {isResetPassword ? "Reset Password" : "Sign in to GlobalNews"}
          </DialogTitle>
        </DialogHeader>
        
        {isResetPassword ? (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                placeholder="Your email address"
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="btn-apple w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg mb-4"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="text-primary hover:underline text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                placeholder="Your email address"
              />
            </div>
            
            <div className="mb-6">
              <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                placeholder="Your password"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="btn-apple w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg mb-4"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="relative flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 my-4">
              <div className="border-t border-neutral-200 dark:border-neutral-700 absolute left-0 right-0"></div>
              <div className="bg-white dark:bg-neutral-800 px-4 relative">or continue with</div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="btn-apple w-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-800 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center mb-4"
            >
              <i className="fas fa-globe mr-2"></i> Google
            </Button>
            
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSignupClick}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
