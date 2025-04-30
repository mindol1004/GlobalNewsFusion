import { useAuth as useAuthBase } from "../contexts/AuthContext";
import { logout } from "../lib/auth-helpers";
import { useToast } from "./use-toast";

export function useAuth() {
  const auth = useAuthBase();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    ...auth,
    signOut
  };
}