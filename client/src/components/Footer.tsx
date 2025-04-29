import { Link } from "wouter";
import { CATEGORIES } from "../types";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">GlobalNews</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">Your trusted source for global news and analysis, delivered in your preferred language.</p>
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
            <h3 className="font-bold mb-4 dark:text-white">Categories</h3>
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
            <h3 className="font-bold mb-4 dark:text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-neutral-600 hover:text-primary dark:text-neutral-400">About Us</a></li>
              <li><a href="#contact" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Contact</a></li>
              <li><a href="#careers" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Careers</a></li>
              <li><a href="#advertise" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Advertise</a></li>
              <li><a href="#press" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#terms" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Terms of Service</a></li>
              <li><a href="#privacy" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Privacy Policy</a></li>
              <li><a href="#cookies" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Cookie Policy</a></li>
              <li><a href="#accessibility" className="text-neutral-600 hover:text-primary dark:text-neutral-400">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-8 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} GlobalNews. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span>Language:</span>
                <div className="relative w-32">
                  <select className="appearance-none w-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-1 pr-8 focus:outline-none focus:border-primary focus-effect text-sm">
                    <option>English</option>
                    <option>Español</option>
                    <option>Français</option>
                    <option>Deutsch</option>
                    <option>日本語</option>
                    <option>한국어</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
