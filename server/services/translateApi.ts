import axios from "axios";

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

// 🔐 환경변수는 함수 내부에서 안전하게 접근
function getLibreTranslateUrl(): string | undefined {
  return process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de';
}

function getLibreTranslateApiKey(): string | undefined {
  return process.env.LIBRE_TRANSLATE_API_KEY;
}

// 🔄 번역 캐시 구현
class TranslationCache {
  private readonly cache: Map<string, { text: string; timestamp: number }> =
    new Map();
  private readonly ttl: number; // Time to live in ms

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): string | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.text;
  }

  set(key: string, text: string): void {
    if (this.cache.size > 1000) {
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

// 지원되는 언어 코드 리스트
const supportedLanguageCodes = [
  "ko",
  "en",
  "ja",
  "zh",
  "es",
  "fr",
  "de",
  "ru",
  "it",
  "pt",
  "ar",
  "tr",
  "nl",
  "cs",
  "pl",
];

// 언어 코드 정규화 함수
function normalizeLanguageCode(langCode: string): string {
  if (!langCode) return "auto";

  // 소문자 변환
  const code = langCode.toLowerCase().trim();

  // 특정 언어 코드 매핑
  const languageMap: Record<string, string> = {
    auto: "auto",
    en: "en",
    english: "en",
    ko: "ko",
    korean: "ko",
    한국어: "ko",
    fr: "fr",
    french: "fr",
    es: "es",
    spanish: "es",
    de: "de",
    german: "de",
    it: "it",
    italian: "it",
    ja: "ja",
    japanese: "ja",
    일본어: "ja",
    ru: "ru",
    russian: "ru",
    zh: "zh",
    chinese: "zh",
    中文: "zh",
    pt: "pt",
    portuguese: "pt",
    ar: "ar",
    arabic: "ar",
    tr: "tr",
    turkish: "tr",
    nl: "nl",
    dutch: "nl",
    cs: "cs",
    czech: "cs",
    pl: "pl",
    polish: "pl",
  };

  // 매핑된 코드가 있으면 반환
  if (languageMap[code]) {
    return languageMap[code];
  }

  // 지원되는 언어 코드인지 확인
  if (supportedLanguageCodes.includes(code)) {
    return code;
  }

  // 기본값으로 auto 반환 (소스 언어인 경우)
  // 또는 오류가 발생하지 않도록 en 반환 (타겟 언어인 경우)
  return code === "auto" ? "auto" : "en";
}

/**
 * Translate text using LibreTranslate API
 */
export async function translateText(params: TranslateParams): Promise<string> {
  try {
    const { text, targetLanguage, sourceLanguage } = params;

    if (!text.trim()) return text;
    if (sourceLanguage === targetLanguage) return text;

    // 언어 코드 정규화
    const normalizedSourceLang = normalizeLanguageCode(
      sourceLanguage ?? "auto",
    );
    const normalizedTargetLang = normalizeLanguageCode(targetLanguage);

    const cacheKey = `${normalizedSourceLang}_${normalizedTargetLang}_${text}`;
    const cachedTranslation = translationCache.get(cacheKey);
    if (cachedTranslation) return cachedTranslation;

    const requestData = {
      q: text,
      source: normalizedSourceLang,
      target: normalizedTargetLang,
      format: "text",
      api_key: getLibreTranslateApiKey(),
    };

    const libreTranslateUrl = getLibreTranslateUrl();
    if (!libreTranslateUrl) throw new Error("번역 서버 URL이 없습니다.");

    const response = await axios.post<TranslateResponse>(
      libreTranslateUrl,
      requestData,
      {
        timeout: 10000,
        timeoutErrorMessage: "번역 서버 연결 시간 초과",
      },
    );

    const translatedText = response.data.translatedText;
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (error: any) {
    console.error("Translation error:", error.response?.data ?? error.message);
    throw new Error(`Translation failed: ${error.message}`);
  }
}
