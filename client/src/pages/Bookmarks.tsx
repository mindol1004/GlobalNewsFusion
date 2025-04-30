import { useEffect } from "react";
import { useLocation } from "wouter";
import NewsCard from "../components/NewsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../hooks/useAuth";
import { useBookmarks } from "../hooks/useBookmarks";

export default function Bookmarks() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { bookmarks, isLoading, error } = useBookmarks();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/");
      toast({
        title: "로그인이 필요합니다",
        description: "북마크를 보려면 로그인해주세요.",
        variant: "destructive",
      });
    }

    // Set document title
    document.title = "북마크 - GlobalNews";
  }, [navigate, toast, user, authLoading]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-xl">북마크 불러오는 중...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Already redirecting in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold dark:text-white">북마크</h1>
        {bookmarks?.length > 0 && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/")}
          >
            뉴스 홈으로
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
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">북마크 불러오기 실패</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">북마크를 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.</p>
          <Button onClick={() => navigate("/")}>
            홈으로 가기
          </Button>
        </div>
      ) : bookmarks?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">북마크가 없습니다</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">관심있는 뉴스를 북마크에 추가해보세요.</p>
          <Button onClick={() => navigate("/")}>
            뉴스 둘러보기
          </Button>
        </div>
      )}
    </div>
  );
}