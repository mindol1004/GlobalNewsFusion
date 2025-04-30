import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useBookmarks } from "../hooks/useBookmarks";
import { NewsArticle } from "@shared/schema";
import { useTranslationContext } from "../contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

export default function FeaturedNewsCard({ article }: FeaturedNewsCardProps) {
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
    
    // 자동 번역 수행 (주요 기사는 우선적으로 번역)
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
    <div className="news-card lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark overflow-hidden">
      <div className="relative h-80 md:h-96">
        <img 
          src={article.image || "https://placehold.co/1080x580/e2e8f0/334155?text=No+Image"}
          alt={article.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://placehold.co/1080x580/e2e8f0/334155?text=Image+Error";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex mb-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary rounded-full">
              {article.category || "General"}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {isTranslated ? translatedArticle.title : article.title}
          </h3>
          <p className="mb-2 line-clamp-2">
            {isTranslated ? translatedArticle.description : article.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">{article.source.name} • {formattedTime}</span>
              {!isTranslated && article.language !== userLanguage && (
                <button 
                  className="text-sm flex items-center gap-1 hover:text-primary-dark"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  <i className="fas fa-globe text-xs"></i>
                  <span>{isTranslating ? "번역 중..." : "번역하기"}</span>
                </button>
              )}
            </div>
            <button 
              className="text-white p-1 rounded-full hover:bg-white/10"
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
              onClick={() => toggleBookmark(article)}
            >
              <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
