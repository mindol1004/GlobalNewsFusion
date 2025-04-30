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
  const { isAuthenticated, userProfile, isInitializing } = useAuth();
  
  console.log("Header rendering, auth state:", { isAuthenticated, userProfile, isInitializing });
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-neutral-800 dark:border-b dark:border-neutral-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <h1 className="text-xl font-bold text-primary dark:text-primary flex items-center">
              <i className="fas fa-globe mr-2"></i>
              <span>GlobalNews</span>
            </h1>
          </div>
        </Link>
        
        {/* Search bar - Desktop */}
        <div className="hidden md:flex flex-1 mx-8">
          <SearchBar />
        </div>
        
        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" 
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            <i className="fas fa-moon hidden dark:block text-neutral-300"></i>
            <i className="fas fa-sun block dark:hidden text-neutral-700"></i>
          </button>
          
          {/* User Profile or Login Buttons */}
          {isAuthenticated ? (
            <UserProfileDropdown user={userProfile} />
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="btn-apple px-4 py-2 bg-neutral-100 rounded-full font-medium text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                onClick={onLoginClick}
              >
                Log in
              </Button>
              <Button 
                className="btn-apple px-4 py-2 bg-primary rounded-full font-medium text-white hover:bg-primary-dark"
                onClick={onSignupClick}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Search bar - Mobile */}
      <div className="block md:hidden px-4 pb-3">
        <SearchBar />
      </div>
      
      {/* Category Tabs */}
      <CategoryTabs activeCategory={location.split('/').pop() || 'general'} />
    </header>
  );
}
