import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { fetchNews } from "../lib/api";
import NewsCard from "../components/NewsCard";
import { CATEGORIES } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  
  // Format dates for API
  const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "/api/news/search",
      {
        query: searchQuery,
        category: category !== "all" ? category : undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        sortBy,
        page,
      },
    ],
    queryFn: () =>
      fetchNews({
        query: searchQuery,
        category: category !== "all" ? category : undefined,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page,
        pageSize: 9,
      }),
    enabled: !!searchQuery,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };
  
  useEffect(() => {
    // Set document title
    document.title = `Search: ${searchQuery || "News"} - GlobalNews`;
  }, [searchQuery]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold dark:text-white mb-6">Search News</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Search news by keyword, title, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">From:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-36 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">To:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-36 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button type="button" variant="outline" className="ml-auto" onClick={() => {
            setStartDate(undefined);
            setEndDate(undefined);
          }}>
            Clear dates
          </Button>
          
          <Button type="submit" className="bg-primary hover:bg-primary-dark text-white">
            Search
          </Button>
        </div>
      </form>
      
      {/* Search results */}
      {initialQuery && !searchQuery && !isLoading && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Enter a search term</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Type in the search box above to find news articles.</p>
        </div>
      )}
      
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold dark:text-white">
            {isLoading
              ? "Searching..."
              : data?.articles?.length
              ? `Results for "${searchQuery}"`
              : `No results for "${searchQuery}"`}
          </h2>
          {data && (
            <p className="text-neutral-600 dark:text-neutral-300 mt-1">
              {data.totalResults} articles found
            </p>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(9).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Error searching news</h2>
          <p className="text-neutral-600 dark:text-neutral-400">There was an error searching for news. Please try again later.</p>
        </div>
      ) : data?.articles?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
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
      ) : searchQuery ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-apple dark:shadow-apple-dark p-8 text-center">
          <h2 className="text-xl font-bold mb-2 dark:text-white">No results found</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Try adjusting your search terms or filters.</p>
        </div>
      ) : null}
    </div>
  );
}
