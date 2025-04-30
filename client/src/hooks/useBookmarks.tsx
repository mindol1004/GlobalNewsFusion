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
  
  const toggleBookmark = async (article: NewsArticle) => {
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }
    
    try {
      if (isBookmarked(article.id)) {
        await removeBookmarkMutation.mutateAsync(article.id);
      } else {
        await addBookmarkMutation.mutateAsync(article.id);
      }
    } catch (error) {
      throw error;
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