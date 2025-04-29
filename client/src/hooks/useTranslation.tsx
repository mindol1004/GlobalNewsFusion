import { useState } from "react";
import { translateText } from "../lib/api";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const translate = async (text: string, targetLanguage?: string, sourceLanguage?: string): Promise<string> => {
    if (!text) return "";
    
    const userLanguage = targetLanguage || userProfile?.preferredLanguage || navigator.language.split('-')[0] || "en";
    
    // Don't translate if the text is already in the target language
    if (sourceLanguage && sourceLanguage === userLanguage) {
      return text;
    }
    
    setIsTranslating(true);
    try {
      const translated = await translateText({
        text,
        targetLanguage: userLanguage,
        sourceLanguage,
      });
      return translated;
    } catch (error: any) {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  };
  
  return {
    translate,
    isTranslating,
  };
}
