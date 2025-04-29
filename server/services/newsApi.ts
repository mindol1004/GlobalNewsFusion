import axios from "axios";
import { NewsApiResponse, NewsArticle } from "@shared/schema";

// Use TheNewsAPI or NewsData.io based on environment variable
const API_KEY = process.env.THE_NEWS_API_KEY || process.env.NEWSDATA_IO_KEY;
const API_BASE_URL = process.env.THE_NEWS_API_KEY 
  ? "https://api.thenewsapi.com/v1/news"
  : "https://newsdata.io/api/1/news";

interface FetchNewsParams {
  category?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch news articles with optional filtering parameters
 */
export async function fetchNews(params: FetchNewsParams = {}): Promise<NewsApiResponse> {
  try {
    const { 
      category, 
      query, 
      startDate, 
      endDate, 
      language = "en", 
      page = 1, 
      pageSize = 10 
    } = params;

    // Cache key for storing API response
    const cacheKey = JSON.stringify({ ...params, API_KEY });
    
    // Check if the request is cached
    const cachedResponse = newsCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Build query parameters based on which API we're using
    const queryParams: Record<string, string | number> = {};
    
    if (process.env.THE_NEWS_API_KEY) {
      // TheNewsAPI parameters
      queryParams.api_token = API_KEY as string;
      queryParams.language = language;
      queryParams.limit = pageSize;
      queryParams.page = page;
      
      if (query) queryParams.search = query;
      if (category) queryParams.categories = category;
      if (startDate) queryParams.published_after = startDate;
      if (endDate) queryParams.published_before = endDate;
      
      const response = await axios.get(`${API_BASE_URL}/all`, { params: queryParams });
      
      // Transform TheNewsAPI response to our standardized format
      const transformedResponse: NewsApiResponse = {
        status: "success",
        totalResults: response.data.meta.found || 0,
        articles: response.data.data.map((article: any) => transformTheNewsApiArticle(article))
      };
      
      // Cache the response
      newsCache.set(cacheKey, transformedResponse);
      
      return transformedResponse;
    } else {
      // NewsData.io parameters
      queryParams.apikey = API_KEY as string;
      queryParams.language = language;
      queryParams.size = pageSize;
      queryParams.page = page;
      
      if (query) queryParams.q = query;
      if (category) queryParams.category = category;
      if (startDate) queryParams.from_date = startDate;
      if (endDate) queryParams.to_date = endDate;
      
      const response = await axios.get(API_BASE_URL, { params: queryParams });
      
      // Transform NewsData.io response to our standardized format
      const transformedResponse: NewsApiResponse = {
        status: response.data.status,
        totalResults: response.data.totalResults || 0,
        articles: response.data.results.map((article: any) => transformNewsDataArticle(article))
      };
      
      // Cache the response
      newsCache.set(cacheKey, transformedResponse);
      
      return transformedResponse;
    }
  } catch (error: any) {
    console.error("Error fetching news:", error.response?.data || error.message);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
}

/**
 * Fetch a specific article by ID
 */
export async function fetchArticleById(id: string): Promise<NewsArticle> {
  try {
    // Check if the article is cached
    const cachedArticle = articleCache.get(id);
    if (cachedArticle) {
      return cachedArticle;
    }

    if (process.env.THE_NEWS_API_KEY) {
      const response = await axios.get(`${API_BASE_URL}/uuid/${id}`, {
        params: {
          api_token: API_KEY
        }
      });
      
      const article = transformTheNewsApiArticle(response.data.data);
      articleCache.set(id, article);
      
      return article;
    } else {
      // For NewsData.io, we don't have a direct endpoint to get by ID
      // So we'll search by ID and get the first result
      const response = await axios.get(API_BASE_URL, {
        params: {
          apikey: API_KEY,
          q: id
        }
      });
      
      if (!response.data.results || response.data.results.length === 0) {
        throw new Error("Article not found");
      }
      
      const article = transformNewsDataArticle(response.data.results[0]);
      articleCache.set(id, article);
      
      return article;
    }
  } catch (error: any) {
    console.error("Error fetching article by ID:", error.response?.data || error.message);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }
}

/**
 * Transform TheNewsAPI article to our standardized format
 */
function transformTheNewsApiArticle(article: any): NewsArticle {
  return {
    id: article.uuid,
    title: article.title,
    description: article.description,
    content: article.snippet || article.description,
    url: article.url,
    image: article.image_url,
    publishedAt: article.published_at,
    source: {
      name: article.source,
      url: article.source_url || ""
    },
    category: article.categories?.[0] || "general",
    language: article.language || "en"
  };
}

/**
 * Transform NewsData.io article to our standardized format
 */
function transformNewsDataArticle(article: any): NewsArticle {
  return {
    id: article.article_id,
    title: article.title,
    description: article.description || "",
    content: article.content || article.description || "",
    url: article.link,
    image: article.image_url,
    publishedAt: article.pubDate,
    source: {
      name: article.source_id,
      url: article.source_url || ""
    },
    category: article.category?.[0] || "general",
    language: article.language || "en"
  };
}

// Simple in-memory cache implementation
interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

class SimpleCache<T> implements Cache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private ttl: number; // Time to live in ms

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // Check if the item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

// Create caches with different TTLs
const newsCache = new SimpleCache<NewsApiResponse>(5); // 5 minutes for news lists
const articleCache = new SimpleCache<NewsArticle>(30); // 30 minutes for individual articles
