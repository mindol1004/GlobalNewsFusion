import { NewsApiResponse, NewsArticle } from "@shared/schema";

interface FetchNewsParams {
  category?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

interface TranslateParams {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export async function fetchNews(params: FetchNewsParams = {}): Promise<NewsApiResponse> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/news?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching news: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchArticleById(id: string): Promise<NewsArticle> {
  const response = await fetch(`/api/news/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error fetching article: ${response.statusText}`);
  }
  
  return response.json();
}

export async function translateText(params: TranslateParams): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error(`Error translating text: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.translatedText;
}

export async function addBookmark(articleId: string): Promise<void> {
  const response = await fetch('/api/bookmarks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articleId }),
  });
  
  if (!response.ok) {
    throw new Error(`Error adding bookmark: ${response.statusText}`);
  }
}

export async function removeBookmark(articleId: string): Promise<void> {
  const response = await fetch(`/api/bookmarks/${articleId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error removing bookmark: ${response.statusText}`);
  }
}

export async function fetchBookmarks(): Promise<NewsArticle[]> {
  const response = await fetch('/api/bookmarks');
  
  if (!response.ok) {
    throw new Error(`Error fetching bookmarks: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateUserPreferences(preferences: Record<string, any>): Promise<void> {
  const response = await fetch('/api/user/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });
  
  if (!response.ok) {
    throw new Error(`Error updating preferences: ${response.statusText}`);
  }
}

export async function getUserPreferences(): Promise<Record<string, any>> {
  const response = await fetch('/api/user/preferences');
  
  if (!response.ok) {
    throw new Error(`Error fetching preferences: ${response.statusText}`);
  }
  
  return response.json();
}
