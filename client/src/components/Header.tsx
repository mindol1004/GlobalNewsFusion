import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "./UserProfileDropdown";
import SearchBar from "./SearchBar";
import CategoryTabs from "./CategoryTabs";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const auth = useAuth();
  const { isAuthenticated, userProfile, isInitializing } = auth;
  
  console.log("Header rendering, auth state:", { 
    isAuthenticated, 
    userProfile: userProfile ? "exists" : "null", 
    isInitializing
  });
  
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Get the current category from the URL if we're on a category page
  const category = location.startsWith("/category/") 
    ? location.replace("/category/", "") 
    : "";

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-2xl font-bold text-primary">
                  GlobalNews
                </span>
              </a>
            </Link>
          </div>

          <div className="hidden md:block mx-4 flex-1 max-w-xl">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </Button>

            {isInitializing ? (
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
            ) : isAuthenticated && userProfile ? (
              <UserProfileDropdown user={userProfile} />
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={onLoginClick}
                  className="text-neutral-700 dark:text-neutral-300"
                >
                  Login
                </Button>
                <Button 
                  onClick={onSignupClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <CategoryTabs activeCategory={category} />
      </div>
    </header>
  );
}