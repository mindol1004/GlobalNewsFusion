import { Request, Response } from "express";
import { fetchNews, fetchArticleById } from "../services/newsApi";

export const newsController = {
  /**
   * Get news articles with optional filtering
   */
  getNews: async (req: Request, res: Response) => {
    try {
      const {
        category,
        query,
        startDate,
        endDate,
        language,
        page = "1",
        pageSize = "10"
      } = req.query;

      const response = await fetchNews({
        category: category as string | undefined,
        query: query as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined, 
        language: language as string | undefined,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      });

      res.json(response);
    } catch (error: any) {
      console.error("Error fetching news:", error);
      res.status(500).json({ 
        message: "Failed to fetch news articles",
        error: error.message 
      });
    }
  },

  /**
   * Get a specific article by ID
   */
  getArticleById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      const article = await fetchArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error: any) {
      console.error("Error fetching article:", error);
      res.status(500).json({ 
        message: "Failed to fetch article",
        error: error.message 
      });
    }
  }
};
