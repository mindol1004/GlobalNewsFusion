import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { fetchNews } from "../lib/api";
import NewsCard from "../components/NewsCard";
import { CATEGORIES } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Category() {
  // Get category from URL
  const [, params] = useRoute("/category/:category");
  const categorySlug = params?.category || "";
  
  const [timeRange, setTimeRange] = useState("today");
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  
  // Find category by slug
  const category = CATEGORIES.find((cat) => cat.slug === categorySlug);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/news", { category: categorySlug, page }],
    queryFn: () => fetchNews({ category: categorySlug, page, pageSize: 9 }),
  });
  
  useEffect(() => {
    // Set document title
    document.title = `${category?.name || "Category"} News - GlobalNews`;
  }, [category]);
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Category not found</h2>
          <p className="text-neutral-600 dark:text-neutral-400">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold dark:text-white mb-4 md:mb-0">{category.name}</h1>
        
        <div className="flex flex-wrap gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Error loading news</h2>
          <p className="text-neutral-600 dark:text-neutral-400">There was an error loading the news. Please try again later.</p>
        </div>
      ) : data?.articles?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((article) => (
              <NewsCard key={article.id} article={article} showCategory={false} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <i className="fas fa-chevron-left mr-1"></i> Previous
            </Button>
            <Button
              variant="outline"
              disabled={!data.articles.length || data.articles.length < 9}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <i className="fas fa-chevron-right ml-1"></i>
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">No news found</h2>
          <p className="text-neutral-600 dark:text-neutral-400">There are no news articles available in this category right now.</p>
        </div>
      )}
    </div>
  );
}
