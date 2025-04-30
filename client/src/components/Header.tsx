import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { CATEGORIES } from "../types";
import UserProfileDropdown from "./UserProfileDropdown";

interface HeaderProps {
  user: any | null;  // Firebase User 객체 또는 서버의 User 객체
  isLoading: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
}

export default function Header({ 
  user, 
  isLoading, 
  onLoginClick, 
  onSignupClick,
  onLogoutClick
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // URL에서 현재 카테고리 가져오기
  const category = location.startsWith("/category/") 
    ? location.replace("/category/", "") 
    : "";

  // 디버깅용 로그
  console.log("Header rendering:", { user, isLoading });

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-primary cursor-pointer">
                GlobalNews
              </span>
            </Link>
          </div>

          <div className="flex-grow mx-4">
            <div className="hidden md:block max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="w-full px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-700 focus:outline-none"
                />
                <button className="absolute right-3 top-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </div>
            </div>
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

            {/* 로그인/로그아웃 버튼 표시 - 인증 상태에 따라 달라짐 */}
            {user ? (
              <div className="flex items-center space-x-2">
                <UserProfileDropdown user={user} onLogoutClick={onLogoutClick} />
              </div>
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
        
        <div className="px-4 pb-1 overflow-x-auto flex no-scrollbar border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-1 min-w-full">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={cat.id === 'general' ? '/' : `/category/${cat.slug}`}>
                <div className={`px-4 py-2 font-medium whitespace-nowrap cursor-pointer ${
                  category === cat.slug
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}