import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { User } from "@shared/schema";
import { signOutUser } from "../lib/auth-fixes";
import { useToast } from "@/hooks/use-toast";

interface UserProfileDropdownProps {
  user: User | null;
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Handle case where user is not provided
  // This can happen during authentication state changes
  const safeUser = user || { 
    username: "User", 
    displayName: "User", 
    email: "Loading..." 
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Get user initials for avatar
  const getInitials = () => {    
    if (safeUser.displayName) {
      return safeUser.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    return safeUser.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* User profile button */}
      <div 
        className="cursor-pointer flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium hidden sm:inline">
          {user?.displayName || user?.username}
        </span>
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="text-sm font-medium">{getInitials()}</span>
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 shadow-apple-lg rounded-lg bg-white dark:bg-neutral-800 dark:shadow-apple-dark-md">
          <div className="p-3 border-b border-neutral-100 dark:border-neutral-700">
            <div className="font-medium">{user?.displayName || user?.username}</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</div>
          </div>
          <div className="py-1">
            <Link href="/profile">
              <a className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <i className="fas fa-user mr-2 text-neutral-500"></i> Profile
              </a>
            </Link>
            <Link href="/bookmarks">
              <a className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <i className="fas fa-bookmark mr-2 text-neutral-500"></i> Bookmarks
              </a>
            </Link>
            <Link href="/profile">
              <a className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <i className="fas fa-cog mr-2 text-neutral-500"></i> Settings
              </a>
            </Link>
            <div className="border-t border-neutral-100 dark:border-neutral-700 mt-1 pt-1">
              <button 
                onClick={async () => {
                  // Close dropdown first
                  setIsOpen(false);

                  // Show success toast
                  toast({
                    title: "Signing out...",
                    description: "Please wait...",
                  });
                  
                  // Use the main signOut method from auth context
                  try {
                    await signOut();
                  } catch (error) {
                    console.error("Error during signOut:", error);
                    
                    // Fallback to direct method
                    console.log("Using fallback signout method");
                    signOutUser();
                    
                    // Show error toast and redirect
                    toast({
                      title: "Signed out with warning",
                      description: "Some errors occurred but you have been signed out.",
                      variant: "destructive"
                    });
                    navigate("/");
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
