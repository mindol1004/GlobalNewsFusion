import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";

interface UserProfileDropdownProps {
  user: FirebaseUser;
  onLogoutClick: () => void;
}

export default function UserProfileDropdown({ user, onLogoutClick }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // Get user initial for avatar
  const getInitial = () => {
    if (user.displayName && typeof user.displayName === 'string') {
      return user.displayName.charAt(0).toUpperCase();
    }
    
    if (user.email && typeof user.email === 'string') {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* User profile button */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          {getInitial()}
        </div>
      </Button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 shadow-lg rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 z-50">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="font-medium">{user.displayName || user.email?.split('@')[0]}</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</div>
          </div>
          <div className="py-1">
            <Link href="/profile">
              <div className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                Profile
              </div>
            </Link>
            <Link href="/bookmarks">
              <div className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                Saved Articles
              </div>
            </Link>
            <div className="border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-1">
              <div 
                onClick={() => {
                  setIsOpen(false);
                  onLogoutClick();
                }}
                className="block px-4 py-2 text-sm text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
              >
                Logout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}