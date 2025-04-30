import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { translateText } from '../lib/api';
import { NewsArticle } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface TranslationContextType {
  translateNewsArticle: (article: NewsArticle) => Promise<NewsArticle>;
  isTranslating: boolean;
  userLanguage: string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export interface TranslationProviderProps {
  children: ReactNode;
}

// 번역 캐시를 클라이언트 측에서 관리하기 위한 맵
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30분 캐시 유효 시간

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // 사용자 언어 감지 및 설정
  useEffect(() => {
    // 사용자 프로필에서 우선 언어 가져오기, 없으면 브라우저 언어 사용
    const detectedLanguage = userProfile?.preferredLanguage || 
                            navigator.language.split('-')[0] || 
                            'en';
    
    setUserLanguage(detectedLanguage);
    
    // 콘솔에 감지된 언어 로그
    console.log('Detected user language:', detectedLanguage);
  }, [userProfile]);

  // 텍스트 캐싱 함수
  const getCachedTranslation = (key: string): string | null => {
    const item = translationCache.get(key);
    
    if (!item) return null;
    
    // 캐시 만료 확인
    if (Date.now() - item.timestamp > CACHE_TTL) {
      translationCache.delete(key);
      return null;
    }
    
    return item.text;
  };

  // 캐시에 번역 저장
  const setCachedTranslation = (key: string, text: string): void => {
    // 캐시 크기 제한
    if (translationCache.size > 500) {
      // 가장 오래된 항목 10% 제거
      const keys = Array.from(translationCache.keys());
      const oldestKeys = keys.slice(0, Math.floor(keys.length * 0.1));
      for (const oldKey of oldestKeys) {
        translationCache.delete(oldKey);
      }
    }
    
    translationCache.set(key, { text, timestamp: Date.now() });
  };

  // 단일 텍스트 번역 함수
  const translateSingleText = async (text: string, sourceLanguage: string = 'en'): Promise<string> => {
    if (!text.trim() || sourceLanguage === userLanguage) {
      return text;
    }

    // 캐시 키 생성
    const cacheKey = `${sourceLanguage}_${userLanguage}_${text}`;
    
    // 캐시에서 번역 확인
    const cachedTranslation = getCachedTranslation(cacheKey);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    try {
      const translated = await translateText({
        text,
        targetLanguage: userLanguage,
        sourceLanguage,
      });
      
      // 번역 결과 캐싱
      setCachedTranslation(cacheKey, translated);
      
      return translated;
    } catch (error: any) {
      console.error('Translation error:', error);
      return text; // 오류 시 원본 텍스트 반환
    }
  };

  // 뉴스 기사 전체 번역 함수
  const translateNewsArticle = async (article: NewsArticle): Promise<NewsArticle> => {
    // 이미 번역된 기사인 경우 그대로 반환
    if (article.isTranslated) {
      return article;
    }

    // 현재 언어가 기사 언어와 같으면 번역 불필요
    if (article.language === userLanguage) {
      return article;
    }

    setIsTranslating(true);

    try {
      // 병렬로 제목, 설명, 내용 번역
      const [translatedTitle, translatedDescription, translatedContent] = await Promise.all([
        translateSingleText(article.title, article.language),
        translateSingleText(article.description, article.language),
        translateSingleText(article.content, article.language)
      ]);

      setIsTranslating(false);

      // 번역된 새 기사 객체 반환
      return {
        ...article,
        title: translatedTitle,
        description: translatedDescription,
        content: translatedContent,
        isTranslated: true
      };
    } catch (error: any) {
      setIsTranslating(false);
      toast({
        title: "번역 실패",
        description: "기사 번역 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
        variant: "destructive",
      });
      return article;
    }
  };

  const value = {
    translateNewsArticle,
    isTranslating,
    userLanguage
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}