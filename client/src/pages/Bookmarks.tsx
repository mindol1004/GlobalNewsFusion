import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import NewsCard from "../components/NewsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { isUserAuthenticated } from "../lib/auth-fixes";
import { NewsArticle } from "@shared/schema";

export default function Bookmarks() {
  // Use direct localStorage check for authenticated status
  const [isAuth, setIsAuth] = useState(isUserAuthenticated());
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Temporary mock data until we fix the backend API
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load bookmarks data
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isUserAuthenticated()) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Set loading to false after a short delay
        // In a real implementation, this would fetch data from the API
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch bookmarks"));
        setIsLoading(false);
      }
    };
    
    fetchBookmarks();
  }, []);
  
  useEffect(() => {
    // Check authentication directly
    const isAuthenticated = isUserAuthenticated();
    setIsAuth(isAuthenticated);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.log("Token not found, redirecting from bookmarks page");
      navigate("/");
      toast({
        title: "Authentication required",
        description: "Please sign in to view your bookmarks.",
        variant: "destructive",
      });
    }
    
    // Set document title
    document.title = "Your Bookmarks - GlobalNews";
  }, [navigate, toast]);
  
  if (!isAuth) {
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
