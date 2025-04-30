import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchNews } from "../lib/api";
import FeaturedNewsCard from "../components/FeaturedNewsCard";
import SideFeaturedNewsCard from "../components/SideFeaturedNewsCard";
import NewsCard from "../components/NewsCard";
import TrendingTopics from "../components/TrendingTopics";
import SubscriptionCTA from "../components/SubscriptionCTA";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  console.log("Home component rendering");
  const [timeRange, setTimeRange] = useState("today");
  
  // Featured news (top headline)
  const { data: featuredNews, isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ["/api/news", { category: "top", pageSize: 3 }],
    queryFn: () => {
      console.log("Fetching featured news");
      return fetchNews({ category: "top", pageSize: 3 });
    },
  });
  
  // Top stories (different from featured with a different category)
  const { data: topStories, isLoading: isTopStoriesLoading, error: topStoriesError } = useQuery({
    queryKey: ["/api/news", { category: "business", pageSize: 6 }],
    queryFn: () => {
      console.log("Fetching top stories");
      return fetchNews({ category: "business", pageSize: 6 });
    },
  });
  
  // International news
  const { data: worldNews, isLoading: isWorldNewsLoading, error: worldNewsError } = useQuery({
    queryKey: ["/api/news", { category: "world", pageSize: 3 }],
    queryFn: () => {
      console.log("Fetching world news");
      return fetchNews({ category: "world", pageSize: 3 });
    },
  });
  
  console.log("Home data:", { 
    featuredNews, isFeaturedLoading, featuredError,
    topStories, isTopStoriesLoading, topStoriesError,
    worldNews, isWorldNewsLoading, worldNewsError
  });
  
  useEffect(() => {
    // Set document title
    document.title = "GlobalNews - Premium News Experience";
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Featured Section */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Today's Highlights</h2>
          <div className="flex items-center gap-2">
            {/* Date selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isFeaturedLoading ? (
            <>
              <Skeleton className="lg:col-span-2 h-80 md:h-96 rounded-xl" />
              <Skeleton className="h-80 md:h-96 rounded-xl" />
            </>
          ) : featuredNews?.articles?.length ? (
            <>
              <FeaturedNewsCard article={featuredNews.articles[0]} />
              <SideFeaturedNewsCard article={featuredNews.articles[1]} />
            </>
          ) : (
            <div className="lg:col-span-3 p-8 bg-white dark:bg-neutral-800 rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">No featured news available</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Try refreshing the page or check back later.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Top stories section */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Top Stories</h2>
          <a href="#more" className="text-primary hover:underline text-sm font-medium">View all</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isTopStoriesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))
          ) : topStories?.articles?.length ? (
            // Filter out articles already in featured news
            topStories.articles
              .filter(article => 
                !featuredNews?.articles || 
                !featuredNews.articles.some(featured => featured.id === article.id)
              )
              .slice(0, 3)
              .map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
          ) : (
            <div className="col-span-3 p-8 bg-white dark:bg-neutral-800 rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">No stories available</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Try refreshing the page or check back later.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Trending topics */}
      <TrendingTopics />
      
      {/* International News Section */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Around the World</h2>
          <a href="#more-world" className="text-primary hover:underline text-sm font-medium">View all</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isWorldNewsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))
          ) : worldNews?.articles?.length ? (
            worldNews.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))
          ) : (
            <div className="col-span-3 p-8 bg-white dark:bg-neutral-800 rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">No international news available</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Try refreshing the page or check back later.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter subscription */}
      <SubscriptionCTA />
    </div>
  );
}
