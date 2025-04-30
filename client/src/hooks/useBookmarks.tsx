import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addBookmark, removeBookmark, fetchBookmarks } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./use-toast";
import { NewsArticle } from "@shared/schema";

export function useBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  
  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/bookmarks"],
    enabled: isAuthenticated,
    placeholderData: [],
  });
  
  const addBookmarkMutation = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark added",
        description: "The article has been added to your bookmarks.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to add bookmark:", error);
      toast({
        title: "Failed to add bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const removeBookmarkMutation = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark removed",
        description: "The article has been removed from your bookmarks.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to remove bookmark:", error);
      toast({
        title: "Failed to remove bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const isBookmarked = (articleId: string) => {
    return (bookmarks as NewsArticle[]).some(bookmark => bookmark.id === articleId);
  };
  
  const toggleBookmark = (article: NewsArticle) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark articles.",
        variant: "destructive",
      });
      return;
    }
    
    if (isBookmarked(article.id)) {
      removeBookmarkMutation.mutate(article.id);
    } else {
      addBookmarkMutation.mutate(article.id);
    }
  };
  
  return {
    bookmarks,
    isLoading,
    error,
    isBookmarked,
    toggleBookmark,
    addBookmark: addBookmarkMutation.mutate,
    removeBookmark: removeBookmarkMutation.mutate,
    isAuthenticated,
  };
}