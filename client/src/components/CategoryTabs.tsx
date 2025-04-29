import { Link } from "wouter";
import { CATEGORIES } from "../types";

interface CategoryTabsProps {
  activeCategory: string;
}

export default function CategoryTabs({ activeCategory }: CategoryTabsProps) {
  return (
    <div className="px-4 pb-1 overflow-x-auto flex no-scrollbar border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex space-x-1 min-w-full">
        {CATEGORIES.map((category) => (
          <Link key={category.id} href={category.id === 'general' ? '/' : `/category/${category.slug}`}>
            <a className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeCategory === category.slug
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}>
              {category.name}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
