import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { registerWithEmail, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await registerWithEmail(email, password, name);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!"
      });
      onClose();
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  };
  
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Account created",
        description: "Your account has been created successfully!"
      });
      onClose();
    } catch (error) {
      // Error is handled in the useAuth hook
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple-lg dark:shadow-apple-dark-md max-w-md w-full mx-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold dark:text-white">
            Create your account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              placeholder="Your full name"
            />
          </div>
          
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
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              placeholder="Create a password"
            />
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              placeholder="Confirm your password"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="btn-apple w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg mb-4"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          
          <div className="relative flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 my-4">
            <div className="border-t border-neutral-200 dark:border-neutral-700 absolute left-0 right-0"></div>
            <div className="bg-white dark:bg-neutral-800 px-4 relative">or continue with</div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignup}
            className="btn-apple w-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-800 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center mb-4"
          >
            <i className="fab fa-google mr-2"></i> Google
          </Button>
          
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
