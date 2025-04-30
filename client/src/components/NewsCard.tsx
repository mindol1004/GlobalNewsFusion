import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useBookmarks } from "../hooks/useBookmarks";
import { NewsArticle } from "@shared/schema";
import { useTranslationContext } from "../contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";

interface NewsCardProps {
  article: NewsArticle;
  showCategory?: boolean;
}

export default function NewsCard({ article, showCategory = true }: NewsCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { translateNewsArticle, isTranslating, userLanguage } = useTranslationContext();
  const { toast } = useToast();
  
  // 번역된 기사 상태 관리
  const [translatedArticle, setTranslatedArticle] = useState<NewsArticle>(article);
  const [isTranslated, setIsTranslated] = useState(article.isTranslated || false);

  const bookmarked = isBookmarked(article.id);
  
  // 컴포넌트 마운트 시 자동 번역 수행
  useEffect(() => {
    // 기사가 이미 번역되었거나 사용자 언어와 기사 언어가 같으면 번역하지 않음
    if (article.isTranslated || article.language === userLanguage) {
      return;
    }
    
    // 자동 번역 수행
    const autoTranslate = async () => {
      try {
        const translated = await translateNewsArticle(article);
        setTranslatedArticle(translated);
        setIsTranslated(true);
      } catch (error) {
        console.error("Auto translation failed:", error);
      }
    };
    
    autoTranslate();
  }, [article, translateNewsArticle, userLanguage]);
  
  // 수동 번역 버튼 핸들러
  const handleTranslate = async () => {
    if (isTranslated) return;
    
    try {
      const translated = await translateNewsArticle(article);
      setTranslatedArticle(translated);
      setIsTranslated(true);
      
      toast({
        title: "번역 완료",
        description: "기사가 번역되었습니다."
      });
    } catch (error) {
      toast({
        title: "번역 실패",
        description: "기사를 번역할 수 없습니다. 나중에 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };
  
  const formattedTime = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : "";
    
  return (
    <div className="news-card bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark overflow-hidden flex flex-col">
      <div className="relative h-48">
        <img 
          src={article.image || "https://placehold.co/500x300/e2e8f0/334155?text=No+Image"}
          alt={article.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://placehold.co/500x300/e2e8f0/334155?text=Image+Error";
          }}
        />
        <div className="absolute top-3 right-3">
          <button 
            className="bg-white/20 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-white/30"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
            onClick={() => toggleBookmark(article)}
          >
            <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
          </button>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <div className="flex justify-between mb-2">
          {showCategory && (
            <span className="px-2 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full">
              {article.category || "General"}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold mb-2 dark:text-white">
          {isTranslated ? translatedArticle.title : article.title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-3">
          {isTranslated ? translatedArticle.description : article.description}
        </p>
      </div>
      <div className="px-4 pb-4 flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
        <span>{article.source.name} • {formattedTime}</span>
        {!isTranslated && article.language !== userLanguage && (
          <button 
            className="flex items-center gap-1 hover:text-primary"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            <i className="fas fa-globe text-xs"></i>
            <span>{isTranslating ? "번역 중..." : "번역하기"}</span>
          </button>
        )}
        {isTranslated && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <i className="fas fa-check text-xs"></i>
            <span>번역됨</span>
          </div>
        )}
      </div>
    </div>
  );
}
