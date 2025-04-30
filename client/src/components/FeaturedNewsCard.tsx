import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useBookmarks } from "../hooks/useBookmarks";
import { NewsArticle } from "@shared/schema";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

export default function FeaturedNewsCard({ article }: FeaturedNewsCardProps) {
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
            {isTranslated ? translatedTitle : article.title}
          </h3>
          <p className="mb-2 line-clamp-2">
            {isTranslated ? translatedDescription : article.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">{article.source.name} • {formattedTime}</span>
              {!isTranslated && article.language !== navigator.language.split('-')[0] && (
                <button 
                  className="text-sm flex items-center gap-1 hover:text-primary-dark"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  <i className="fas fa-globe text-xs"></i>
                  <span>{isTranslating ? "Translating..." : "Translate"}</span>
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
