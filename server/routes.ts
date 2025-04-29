import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { newsController } from "./controllers/news";
import { userController } from "./controllers/user";
import { translationController } from "./controllers/translation";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // News routes
  app.get("/api/news", newsController.getNews);
  app.get("/api/news/:id", newsController.getArticleById);
  
  // Translation routes
  app.post("/api/translate", translationController.translateText);
  
  // User routes - protected with authentication middleware
  app.post("/api/user/register", userController.registerUser);
  app.get("/api/user/profile", authMiddleware, userController.getUserProfile);
  app.put("/api/user/profile", authMiddleware, userController.updateUserProfile);
  app.get("/api/user/preferences", authMiddleware, userController.getUserPreferences);
  app.put("/api/user/preferences", authMiddleware, userController.updateUserPreferences);
  
  // Bookmark routes - protected with authentication middleware
  app.get("/api/bookmarks", authMiddleware, userController.getBookmarks);
  app.post("/api/bookmarks", authMiddleware, userController.addBookmark);
  app.delete("/api/bookmarks/:id", authMiddleware, userController.removeBookmark);
  
  const httpServer = createServer(app);

  return httpServer;
}
