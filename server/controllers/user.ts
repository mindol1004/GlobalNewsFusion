import {
  InsertBookmark,
  insertBookmarkSchema,
  InsertUser,
  InsertUserPreferences,
  insertUserSchema,
  User
} from "@shared/schema";
import { Request, Response } from "express";
import { fetchArticleById } from "../services/newsApi";
import { storage } from "../storage";

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
        return res.status(400).json({ message: "Email과 Firebase ID가 필요합니다" });
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
        photoURL,
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
      console.error("사용자 등록 오류:", error);
      res.status(500).json({
        message: "사용자 등록에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Get user profile
   */
  getUserProfile: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      res.json(req.user);
    } catch (error: any) {
      console.error("프로필 조회 오류:", error);
      res.status(500).json({
        message: "프로필 조회에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const { displayName, preferredLanguage } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        displayName,
        preferredLanguage
      });

      res.json(updatedUser);
    } catch (error: any) {
      console.error("프로필 업데이트 오류:", error);
      res.status(500).json({
        message: "프로필 업데이트에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Get user preferences
   */
  getUserPreferences: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const preferences = await storage.getUserPreferences(req.user.id);

      // 환경설정이 없으면 기본값으로 생성
      if (!preferences) {
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
      console.error("환경설정 조회 오류:", error);
      res.status(500).json({
        message: "환경설정 조회에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Update user preferences
   */
  updateUserPreferences: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const {
        preferredCategories,
        preferredSources,
        preferredLanguage,
        theme,
        displayName
      } = req.body;

      // 사용자 프로필 업데이트 (이름 또는 언어가 제공된 경우)
      if (displayName || preferredLanguage) {
        await storage.updateUser(req.user.id, {
          displayName: displayName ?? req.user.displayName,
          preferredLanguage: preferredLanguage ?? req.user.preferredLanguage
        });
      }

      // 기존 환경설정 확인
      let preferences = await storage.getUserPreferences(req.user.id);

      if (!preferences) {
        // 환경설정이 없으면 새로 생성
        const newPreferences: InsertUserPreferences = {
          userId: req.user.id,
          preferredCategories: preferredCategories ?? ["general", "technology", "business"],
          preferredSources: preferredSources ?? [],
          preferredLanguage: preferredLanguage ?? req.user.preferredLanguage ?? "en",
          theme: theme ?? "system"
        };

        preferences = await storage.createUserPreferences(newPreferences);
      } else {
        // 기존 환경설정 업데이트
        preferences = await storage.updateUserPreferences(req.user.id, {
          preferredCategories: preferredCategories !== undefined ? preferredCategories : preferences.preferredCategories,
          preferredSources: preferredSources !== undefined ? preferredSources : preferences.preferredSources,
          preferredLanguage: preferredLanguage ?? preferences.preferredLanguage,
          theme: theme ?? preferences.theme
        });
      }

      res.json(preferences);
    } catch (error: any) {
      console.error("환경설정 업데이트 오류:", error);
      res.status(500).json({
        message: "환경설정 업데이트에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Get user's bookmarked articles
   */
  getBookmarks: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const bookmarks = await storage.getBookmarksByUserId(req.user.id);
      res.json(bookmarks);
    } catch (error: any) {
      console.error("북마크 조회 오류:", error);
      res.status(500).json({
        message: "북마크 조회에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Add a new bookmark
   */
  addBookmark: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const { articleId } = req.body;

      if (!articleId) {
        return res.status(400).json({ message: "기사 ID가 필요합니다" });
      }

      // Check if bookmark already exists
      const existingBookmark = await storage.getBookmarkByArticleId(req.user.id, articleId);

      if (existingBookmark) {
        return res.status(409).json({ message: "이미 북마크된 기사입니다" });
      }

      // Fetch article details from the news API
      const article = await fetchArticleById(articleId);

      if (!article) {
        return res.status(404).json({ message: "기사를 찾을 수 없습니다" });
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
      console.error("북마크 추가 오류:", error);
      res.status(500).json({
        message: "북마크 추가에 실패했습니다",
        error: error.message
      });
    }
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증되지 않은 요청입니다" });
    }

    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "기사 ID가 필요합니다" });
      }

      // Check if bookmark exists
      const bookmark = await storage.getBookmarkByArticleId(req.user.id, id);

      if (!bookmark) {
        return res.status(404).json({ message: "북마크를 찾을 수 없습니다" });
      }

      // Delete bookmark
      await storage.deleteBookmark(req.user.id, id);

      res.status(200).json({ message: "북마크가 성공적으로 제거되었습니다" });
    } catch (error: any) {
      console.error("북마크 제거 오류:", error);
      res.status(500).json({
        message: "북마크 제거에 실패했습니다",
        error: error.message
      });
    }
  }
};
