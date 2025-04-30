export interface Category {
  id: string;
  name: string;
  nameKo?: string; // 한국어 이름
  slug: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferredLanguage: string;
}

export interface UserPreferences {
  preferredCategories: string[];
  preferredSources: string[];
  preferredLanguage: string;
  theme: 'light' | 'dark' | 'system';
}

// Predefined categories (using NewsData.io supported categories)
export const CATEGORIES: Category[] = [
  { id: 'top', name: 'Top Stories', nameKo: '주요 뉴스', slug: 'top' },
  { id: 'world', name: 'World', nameKo: '세계', slug: 'world' },
  { id: 'business', name: 'Business', nameKo: '경제', slug: 'business' },
  { id: 'technology', name: 'Technology', nameKo: '기술', slug: 'technology' },
  { id: 'entertainment', name: 'Entertainment', nameKo: '엔터테인먼트', slug: 'entertainment' },
  { id: 'sports', name: 'Sports', nameKo: '스포츠', slug: 'sports' },
  { id: 'science', name: 'Science', nameKo: '과학', slug: 'science' },
  { id: 'health', name: 'Health', nameKo: '건강', slug: 'health' },
];
