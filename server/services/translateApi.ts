import axios from "axios";

// LibreTranslate API base URL
const API_URL = process.env.LIBRE_TRANSLATE_URL || "https://libretranslate.com/translate";
const API_KEY = process.env.LIBRE_TRANSLATE_API_KEY;

interface TranslateParams {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
}

/**
 * Translate text using LibreTranslate API
 */
export async function translateText(params: TranslateParams): Promise<string> {
  try {
    const { text, targetLanguage, sourceLanguage } = params;

    // Don't translate empty text
    if (!text.trim()) {
      return text;
    }

    // Check if the text is already in the target language
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Cache key for storing translation result
    const cacheKey = `${sourceLanguage || "auto"}_${targetLanguage}_${text}`;
    
    // Check if the translation is cached
    const cachedTranslation = translationCache.get(cacheKey);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    // Prepare request data
    const requestData = {
      q: text,
      source: sourceLanguage || "auto",
      target: targetLanguage,
      format: "text",
      api_key: API_KEY
    };

    // Make request to LibreTranslate API
    const response = await axios.post<TranslateResponse>(API_URL, requestData);

    const translatedText = response.data.translatedText;
    
    // Cache the translation result
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error: any) {
    console.error("Translation error:", error.response?.data || error.message);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Simple in-memory cache for translations
class TranslationCache {
  private cache: Map<string, { text: string; timestamp: number }> = new Map();
  private ttl: number; // Time to live in ms

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): string | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // Check if the item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.text;
  }

  set(key: string, text: string): void {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 1000) {
      // Delete the oldest 10% of entries
      const keys = Array.from(this.cache.keys());
      const oldestKeys = keys.slice(0, Math.floor(keys.length * 0.1));
      for (const oldKey of oldestKeys) {
        this.cache.delete(oldKey);
      }
    }
    
    this.cache.set(key, { text, timestamp: Date.now() });
  }
}

const translationCache = new TranslationCache();
