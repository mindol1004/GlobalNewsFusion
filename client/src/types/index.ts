export interface Category {
  id: string;
  name: string;
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

// Predefined categories
export const CATEGORIES: Category[] = [
  { id: 'general', name: 'Top Stories', slug: 'general' },
  { id: 'world', name: 'World', slug: 'world' },
  { id: 'business', name: 'Business', slug: 'business' },
  { id: 'technology', name: 'Technology', slug: 'technology' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'science', name: 'Science', slug: 'science' },
  { id: 'health', name: 'Health', slug: 'health' },
];
