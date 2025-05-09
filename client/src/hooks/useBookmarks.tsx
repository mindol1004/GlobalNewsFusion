import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addBookmark, removeBookmark, fetchBookmarks } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./use-toast";
import { NewsArticle } from "@shared/schema";

export function useBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/bookmarks", user?.uid],
    enabled: !!user,
    queryFn: fetchBookmarks,
    placeholderData: [],
  });

  const addBookmarkMutation = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "북마크 추가",
        description: "기사가 북마크에 추가되었습니다.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to add bookmark:", error);
      toast({
        title: "북마크 추가 실패",
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
        title: "북마크 제거",
        description: "기사가 북마크에서 제거되었습니다.",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to remove bookmark:", error);
      toast({
        title: "북마크 제거 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isBookmarked = (articleId: string) => {
    return (bookmarks as NewsArticle[]).some(
      (bookmark) => bookmark.id === articleId,
    );
  };

  const toggleBookmark = async (article: NewsArticle) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "북마크 기능을 사용하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked(article.id)) {
        await removeBookmarkMutation.mutateAsync(article.id);
      } else {
        await addBookmarkMutation.mutateAsync(article.id);
      }
    } catch (error) {
      toast({
        title: "북마크 실패",
        description: "북마크 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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
    isAuthenticated: !!user,
  };
}
