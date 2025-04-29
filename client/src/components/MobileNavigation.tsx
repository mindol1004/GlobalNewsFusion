import { Link, useLocation } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 z-40">
      <div className="flex justify-around py-2">
        <Link href="/">
          <a className={`flex flex-col items-center py-1 px-3 ${
            location === "/" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
          }`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/search">
          <a className={`flex flex-col items-center py-1 px-3 ${
            location === "/search" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
          }`}>
            <i className="fas fa-compass text-lg"></i>
            <span className="text-xs mt-1">Explore</span>
          </a>
        </Link>
        <Link href="/bookmarks">
          <a className={`flex flex-col items-center py-1 px-3 ${
            location === "/bookmarks" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
          }`}>
            <i className="fas fa-bookmark text-lg"></i>
            <span className="text-xs mt-1">Saved</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-1 px-3 ${
            location === "/profile" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
          }`}>
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
