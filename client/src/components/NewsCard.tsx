import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useBookmarks } from "../hooks/useBookmarks";
import { NewsArticle } from "@shared/schema";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";

interface NewsCardProps {
  article: NewsArticle;
  showCategory?: boolean;
}

export default function NewsCard({ article, showCategory = true }: NewsCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { translate, isTranslating } = useTranslation();
  const { toast } = useToast();
  const [isTranslated, setIsTranslated] = useState(article.isTranslated || false);
  const [translatedTitle, setTranslatedTitle] = useState(article.title);
  const [translatedDescription, setTranslatedDescription] = useState(article.description);

  const bookmarked = isBookmarked(article.id);
  
  const handleTranslate = async () => {
    if (isTranslated) return;
    
    try {
      const [titleResult, descriptionResult] = await Promise.all([
        translate(article.title, undefined, article.language),
        translate(article.description, undefined, article.language)
      ]);
      
      setTranslatedTitle(titleResult);
      setTranslatedDescription(descriptionResult);
      setIsTranslated(true);
      
      toast({
        title: "Translation complete",
        description: "The article has been translated."
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Could not translate the article. Please try again later.",
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
          {isTranslated ? translatedTitle : article.title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-3">
          {isTranslated ? translatedDescription : article.description}
        </p>
      </div>
      <div className="px-4 pb-4 flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
        <span>{article.source.name} • {formattedTime}</span>
        {!isTranslated && article.language !== navigator.language.split('-')[0] && (
          <button 
            className="flex items-center gap-1 hover:text-primary"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            <i className="fas fa-globe text-xs"></i>
            <span>{isTranslating ? "Translating..." : "Translate"}</span>
          </button>
        )}
        {isTranslated && (
          <div className="flex items-center gap-1">
            <i className="fas fa-globe text-xs"></i>
            <span>Translated</span>
          </div>
        )}
      </div>
    </div>
  );
}
