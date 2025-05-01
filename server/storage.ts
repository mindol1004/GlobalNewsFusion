import { type Bookmark, type InsertBookmark, type InsertUser, type InsertUserPreferences, type User, type UserPreferences } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Bookmark operations
  getBookmark(id: number): Promise<Bookmark | undefined>;
  getBookmarkByArticleId(userId: number, articleId: string): Promise<Bookmark | undefined>;
  getBookmarksByUserId(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, articleId: string): Promise<void>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferencesData: Partial<UserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private readonly users: Map<number, User>;
  private readonly bookmarks: Map<number, Bookmark>;
  private readonly userPrefs: Map<number, UserPreferences>;
  currentUserId: number;
  currentBookmarkId: number;
  currentPrefId: number;

  constructor() {
    this.users = new Map();
    this.bookmarks = new Map();
    this.userPrefs = new Map();
    this.currentUserId = 1;
    this.currentBookmarkId = 1;
    this.currentPrefId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt,
      password: insertUser.password ?? null,
      firebaseId: insertUser.firebaseId ?? null,
      displayName: insertUser.displayName ?? null,
      photoURL: insertUser.photoURL ?? null,
      preferredLanguage: insertUser.preferredLanguage ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Bookmark operations
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async getBookmarkByArticleId(userId: number, articleId: string): Promise<Bookmark | undefined> {
    return Array.from(this.bookmarks.values()).find(
      (bookmark) => bookmark.userId === userId && bookmark.articleId === articleId,
    );
  }

  async getBookmarksByUserId(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId,
    );
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const createdAt = new Date();
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      createdAt,
      description: insertBookmark.description ?? null,
      imageUrl: insertBookmark.imageUrl ?? null,
      source: insertBookmark.source ?? null,
      publishedAt: insertBookmark.publishedAt ?? null,
      category: insertBookmark.category ?? null
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: number, articleId: string): Promise<void> {
    const bookmark = await this.getBookmarkByArticleId(userId, articleId);
    if (bookmark) {
      this.bookmarks.delete(bookmark.id);
    }
  }

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPrefs.values()).find(
      (pref) => pref.userId === userId,
    );
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentPrefId++;
    const preferences: UserPreferences = {
      ...insertPreferences,
      id,
      preferredLanguage: insertPreferences.preferredLanguage ?? null,
      theme: insertPreferences.theme ?? null,
      preferredCategories: insertPreferences.preferredCategories ?? {},
      preferredSources: insertPreferences.preferredSources ?? {}
    };
    this.userPrefs.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: number, preferencesData: Partial<UserPreferences>): Promise<UserPreferences> {
    const preferences = await this.getUserPreferences(userId);
    if (!preferences) {
      throw new Error(`Preferences for user ${userId} not found`);
    }
    
    const updatedPreferences = { ...preferences, ...preferencesData };
    this.userPrefs.set(preferences.id, updatedPreferences);
    return updatedPreferences;
  }
}

export const storage = new MemStorage();
