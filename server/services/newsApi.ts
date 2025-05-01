import { NewsApiResponse, NewsArticle } from "@shared/schema";
import axios from "axios";

// Use NewsData.io API
const USE_THE_NEWS_API = false;
const API_BASE_URL = "https://newsdata.io/api/1/news";

// Simple in-memory cache implementation
interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

class SimpleCache<T> implements Cache<T> {
  private readonly cache: Map<string, { value: T; timestamp: number }> = new Map();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
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

const newsCache = new SimpleCache<NewsApiResponse>(5);
const articleCache = new SimpleCache<NewsArticle>(30);

// 🟢 Helper to safely get API keys at runtime
function getNewsApiKey(): string {
  const key = process.env.NEWSDATA_IO_KEY;
  if (!key) throw new Error("Missing environment variable: NEWSDATA_IO_KEY");
  return key;
}

function getTheNewsApiKey(): string {
  const key = process.env.THE_NEWS_API_KEY;
  if (!key) throw new Error("Missing environment variable: THE_NEWS_API_KEY");
  return key;
}

interface FetchNewsParams {
  category?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

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

    const apiKey = USE_THE_NEWS_API ? getTheNewsApiKey() : getNewsApiKey();

    const cacheKey = JSON.stringify({ ...params, apiKey });
    const cachedResponse = newsCache.get(cacheKey);
    if (cachedResponse) return cachedResponse;

    const queryParams: Record<string, string | number> = {};

    if (USE_THE_NEWS_API) {
      queryParams.api_token = apiKey;
      queryParams.language = language;
      queryParams.limit = pageSize;
      queryParams.page = page;
      if (query) queryParams.search = query;
      if (category) queryParams.categories = category;
      if (startDate) queryParams.published_after = startDate;
      if (endDate) queryParams.published_before = endDate;

      const response = await axios.get(`${API_BASE_URL}/all`, { params: queryParams });

      const transformedResponse: NewsApiResponse = {
        status: "success",
        totalResults: response.data.meta.found ?? 0,
        articles: response.data.data.map((article: any) => transformTheNewsApiArticle(article))
      };

      newsCache.set(cacheKey, transformedResponse);
      return transformedResponse;

    } else {
      queryParams.apikey = apiKey;
      queryParams.language = language;
      queryParams.size = pageSize;
      if (typeof page === "string" && page !== "1") {
        queryParams.page = page;
      }
      if (query) queryParams.q = query;
      if (category) queryParams.category = category;
      if (startDate) queryParams.from_date = startDate;
      if (endDate) queryParams.to_date = endDate;

      const response = await axios.get(API_BASE_URL, { params: queryParams });

      const transformedResponse: NewsApiResponse = {
        status: response.data.status,
        totalResults: response.data.totalResults ?? 0,
        articles: response.data.results.map((article: any) => transformNewsDataArticle(article))
      };

      newsCache.set(cacheKey, transformedResponse);
      return transformedResponse;
    }
  } catch (error: any) {
    console.error("Error fetching news:", error.response?.data ?? error.message);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
}

export async function fetchArticleById(id: string): Promise<NewsArticle> {
  try {
    const cachedArticle = articleCache.get(id);
    if (cachedArticle) return cachedArticle;

    if (USE_THE_NEWS_API) {
      const response = await axios.get(`${API_BASE_URL}/uuid/${id}`, {
        params: { api_token: getTheNewsApiKey() }
      });

      const article = transformTheNewsApiArticle(response.data.data);
      articleCache.set(id, article);
      return article;
    } else {
      const response = await axios.get(API_BASE_URL, {
        params: { apikey: getNewsApiKey(), q: id }
      });

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error("Article not found");
      }

      const article = transformNewsDataArticle(response.data.results[0]);
      articleCache.set(id, article);
      return article;
    }
  } catch (error: any) {
    console.error("Error fetching article by ID:", error.response?.data ?? error.message);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }
}

function transformTheNewsApiArticle(article: any): NewsArticle {
  return {
    id: article.uuid,
    title: article.title,
    description: article.description,
    content: article.snippet ?? article.description,
    url: article.url,
    image: article.image_url,
    publishedAt: article.published_at,
    source: {
      name: article.source,
      url: article.source_url ?? ""
    },
    category: article.categories?.[0] ?? "general",
    language: article.language ?? "en"
  };
}

function transformNewsDataArticle(article: any): NewsArticle {
  return {
    id: article.article_id,
    title: article.title,
    description: article.description ?? "",
    content: article.content ?? article.description ?? "",
    url: article.link,
    image: article.image_url,
    publishedAt: article.pubDate,
    source: {
      name: article.source_id,
      url: article.source_url ?? ""
    },
    category: article.category?.[0] ?? "general",
    language: article.language ?? "en"
  };
}
