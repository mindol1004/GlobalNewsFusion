import { Link } from "wouter";
import { CATEGORIES } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslationContext } from '../contexts/TranslationContext';

export default function Footer() {
  const { translateText, userLanguage } = useTranslationContext();
  
  return (
    <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">GlobalNews</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              {userLanguage === 'ko' 
                ? '선호하는 언어로 제공되는 글로벌 뉴스와 분석을 위한 신뢰할 수 있는 소스입니다.' 
                : 'Your trusted source for global news and analysis, delivered in your preferred language.'}
            </p>
            <div className="flex space-x-4">
              <a href="#twitter" className="text-neutral-500 hover:text-primary dark:text-neutral-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#facebook" className="text-neutral-500 hover:text-primary dark:text-neutral-400">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#instagram" className="text-neutral-500 hover:text-primary dark:text-neutral-400">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#linkedin" className="text-neutral-500 hover:text-primary dark:text-neutral-400">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">
              {userLanguage === 'ko' ? '카테고리' : 'Categories'}
            </h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link href={category.id === 'general' ? '/' : `/category/${category.slug}`}>
                    <a className="text-neutral-600 hover:text-primary dark:text-neutral-400">{category.name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">
              {userLanguage === 'ko' ? '회사' : 'Company'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '회사 소개' : 'About Us'}
              </a></li>
              <li><a href="#contact" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '연락처' : 'Contact'}
              </a></li>
              <li><a href="#careers" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '채용정보' : 'Careers'}
              </a></li>
              <li><a href="#advertise" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '광고문의' : 'Advertise'}
              </a></li>
              <li><a href="#press" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '언론보도' : 'Press'}
              </a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">
              {userLanguage === 'ko' ? '법적 고지' : 'Legal'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#terms" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '서비스 이용약관' : 'Terms of Service'}
              </a></li>
              <li><a href="#privacy" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
              </a></li>
              <li><a href="#cookies" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '쿠키 정책' : 'Cookie Policy'}
              </a></li>
              <li><a href="#accessibility" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                {userLanguage === 'ko' ? '접근성' : 'Accessibility'}
              </a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-8 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} GlobalNews. {userLanguage === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}</p>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span>{userLanguage === 'ko' ? '언어:' : 'Language:'}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
