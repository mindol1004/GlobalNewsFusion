import { Request, Response } from "express";
import { storage } from "../storage";
import { verifyFirebaseToken } from "../services/firebase";
import { 
  insertUserSchema, 
  insertBookmarkSchema, 
  insertUserPreferencesSchema,
  User,
  InsertUser,
  Bookmark,
  InsertBookmark,
  UserPreferences,
  InsertUserPreferences
} from "@shared/schema";
import { fetchArticleById } from "../services/newsApi";

// Add types for authenticated request
interface AuthRequest extends Request {
  user?: User;
}

export const userController = {
  /**
   * Register a new user or update existing user from Firebase authentication
   */
  registerUser: async (req: Request, res: Response) => {
    try {
      const { email, displayName, photoURL, firebaseId } = req.body;

      if (!email || !firebaseId) {
        return res.status(400).json({ 
          message: "Email and Firebase ID are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseId(firebaseId);

      if (existingUser) {
        // Update existing user
        const updatedUser = await storage.updateUser(existingUser.id, {
          displayName: displayName || existingUser.displayName,
          photoURL: photoURL || existingUser.photoURL
        });

        return res.json(updatedUser);
      }

      // Generate a username from email
      const username = email.split("@")[0];

      // Create new user
      const userData: InsertUser = {
        username,
        email,
        firebaseId,
        displayName: displayName || username,
        photoURL: photoURL || undefined,
        preferredLanguage: "en"
      };

      const validatedData = insertUserSchema.parse(userData);
      const newUser = await storage.createUser(validatedData);

      // Create default user preferences
      const userPreferences: InsertUserPreferences = {
        userId: newUser.id,
        preferredCategories: ["general", "technology", "business"],
        preferredSources: [],
        preferredLanguage: "en",
        theme: "system"
      };

      await storage.createUserPreferences(userPreferences);

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error("Error registering user:", error);
      res.status(500).json({ 
        message: "Failed to register user",
        error: error.message 
      });
    }
  },

  /**
   * Get user profile
   */
  getUserProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json(req.user);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ 
        message: "Failed to fetch user profile",
        error: error.message 
      });
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { displayName, preferredLanguage } = req.body;

      const updatedUser = await storage.updateUser(req.user.id, {
        displayName,
        preferredLanguage
      });

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ 
        message: "Failed to update user profile",
        error: error.message 
      });
    }
  },

  /**
   * Get user preferences
   */
  getUserPreferences: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const preferences = await storage.getUserPreferences(req.user.id);

      if (!preferences) {
        // Create default preferences if none exist
        const defaultPreferences: InsertUserPreferences = {
          userId: req.user.id,
          preferredCategories: ["general", "technology", "business"],
          preferredSources: [],
          preferredLanguage: req.user.preferredLanguage || "en",
          theme: "system"
        };

        const newPreferences = await storage.createUserPreferences(defaultPreferences);
        return res.json(newPreferences);
      }

      res.json(preferences);
    } catch (error: any) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ 
        message: "Failed to fetch user preferences",
        error: error.message 
      });
    }
  },

  /**
   * Update user preferences
   */
  updateUserPreferences: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { 
        preferredCategories, 
        preferredSources, 
        preferredLanguage,
        theme,
        displayName
      } = req.body;

      // Update user profile if display name or language is provided
      if (displayName || preferredLanguage) {
        await storage.updateUser(req.user.id, {
          displayName: displayName || req.user.displayName,
          preferredLanguage: preferredLanguage || req.user.preferredLanguage
        });
      }

      // Get existing preferences
      let preferences = await storage.getUserPreferences(req.user.id);

      if (!preferences) {
        // Create new preferences if none exist
        const newPreferences: InsertUserPreferences = {
          userId: req.user.id,
          preferredCategories: preferredCategories || ["general", "technology", "business"],
          preferredSources: preferredSources || [],
          preferredLanguage: preferredLanguage || req.user.preferredLanguage || "en",
          theme: theme || "system"
        };

        preferences = await storage.createUserPreferences(newPreferences);
      } else {
        // Update existing preferences
        preferences = await storage.updateUserPreferences(req.user.id, {
          preferredCategories: preferredCategories !== undefined ? preferredCategories : preferences.preferredCategories,
          preferredSources: preferredSources !== undefined ? preferredSources : preferences.preferredSources,
          preferredLanguage: preferredLanguage || preferences.preferredLanguage,
          theme: theme || preferences.theme
        });
      }

      res.json(preferences);
    } catch (error: any) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ 
        message: "Failed to update user preferences",
        error: error.message 
      });
    }
  },

  /**
   * Get user's bookmarked articles
   */
  getBookmarks: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookmarks = await storage.getBookmarksByUserId(req.user.id);
      res.json(bookmarks);
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ 
        message: "Failed to fetch bookmarks",
        error: error.message 
      });
    }
  },

  /**
   * Add a new bookmark
   */
  addBookmark: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { articleId } = req.body;

      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Check if bookmark already exists
      const existingBookmark = await storage.getBookmarkByArticleId(req.user.id, articleId);

      if (existingBookmark) {
        return res.status(409).json({ message: "Article is already bookmarked" });
      }

      // Fetch article details from the news API
      const article = await fetchArticleById(articleId);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Create bookmark
      const bookmarkData: InsertBookmark = {
        userId: req.user.id,
        articleId: article.id,
        title: article.title,
        description: article.description,
        imageUrl: article.image,
        source: article.source.name,
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        category: article.category
      };

      const validatedData = insertBookmarkSchema.parse(bookmarkData);
      const bookmark = await storage.createBookmark(validatedData);

      res.status(201).json(bookmark);
    } catch (error: any) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ 
        message: "Failed to add bookmark",
        error: error.message 
      });
    }
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Check if bookmark exists
      const bookmark = await storage.getBookmarkByArticleId(req.user.id, id);

      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      // Delete bookmark
      await storage.deleteBookmark(req.user.id, id);

      res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error: any) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ 
        message: "Failed to remove bookmark",
        error: error.message 
      });
    }
  }
};
