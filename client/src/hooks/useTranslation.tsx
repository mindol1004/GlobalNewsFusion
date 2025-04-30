import { useTranslationContext } from '../contexts/TranslationContext';

// 다국어 UI 텍스트를 위한 번역 훅
// UI 요소에서 직접 사용할 수 있는 간단한 인터페이스를 제공합니다
export function useTranslation() {
  const { translateText, userLanguage } = useTranslationContext();

  // 언어 코드에 따라 다른 텍스트를 반환하는 함수
  const t = (en: string, ko: string): string => {
    if (userLanguage === 'ko') return ko;
    // 영어가 기본값
    return en;
  };

  // 번역 함수
  const translate = async (text: string, targetLang?: string, sourceLang?: string): Promise<string> => {
    return translateText(text, sourceLang);
  };

  // 언어 코드를 사람이 읽을 수 있는 이름으로 변환
  const getLanguageName = (code: string): string => {
    switch (code) {
      case 'ko': return '한국어';
      case 'en': return 'English';
      case 'ja': return '日本語';
      case 'zh': return '中文';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'ru': return 'Русский';
      default: return code;
    }
  };

  return { 
    t, 
    translate, 
    isTranslating: false, 
    getLanguageName,
    currentLanguage: userLanguage
  };
}