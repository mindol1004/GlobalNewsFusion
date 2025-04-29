import { Request, Response } from "express";
import { translateText } from "../services/translateApi";

export const translationController = {
  /**
   * Translate text to the specified language
   */
  translateText: async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!targetLanguage) {
        return res.status(400).json({ message: "Target language is required" });
      }

      const translatedText = await translateText({
        text,
        targetLanguage,
        sourceLanguage
      });

      res.json({ 
        originalText: text, 
        translatedText,
        sourceLanguage,
        targetLanguage
      });
    } catch (error: any) {
      console.error("Error translating text:", error);
      res.status(500).json({ 
        message: "Failed to translate text",
        error: error.message 
      });
    }
  }
};
