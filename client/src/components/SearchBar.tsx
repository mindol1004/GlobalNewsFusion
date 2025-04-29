import { useState } from "react";
import { useLocation } from "wouter";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input 
        type="search" 
        placeholder="Search news by keyword, title, or source..."
        className="w-full py-2 pl-10 pr-4 rounded-lg bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-700 dark:border-neutral-600"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <i className="fas fa-search text-neutral-400"></i>
      </div>
    </form>
  );
}
