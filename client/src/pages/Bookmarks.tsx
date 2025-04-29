import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useBookmarks } from "../hooks/useBookmarks";
import NewsCard from "../components/NewsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { bookmarks, isLoading, error } = useBookmarks();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !isLoading) {
      navigate("/");
      toast({
        title: "Authentication required",
        description: "Please sign in to view your bookmarks.",
        variant: "destructive",
      });
    }
    
    // Set document title
    document.title = "Your Bookmarks - GlobalNews";
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  if (!isAuthenticated) {
    return null; // Already redirecting in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Your Bookmarks</h1>
        {bookmarks?.length > 0 && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to News
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Error loading bookmarks</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">There was an error loading your bookmarks. Please try again later.</p>
          <Button onClick={() => navigate("/")}>
            Go to Homepage
          </Button>
        </div>
      ) : bookmarks?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">No bookmarks yet</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Start adding articles to your bookmarks to read them later.</p>
          <Button onClick={() => navigate("/")}>
            Browse News
          </Button>
        </div>
      )}
    </div>
  );
}
