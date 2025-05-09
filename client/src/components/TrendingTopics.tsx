
import React from 'react';
import { Link } from 'wouter';

export default function TrendingTopics() {
  const trendingTopics = [
    'Technology',
    'Politics',
    'Business',
    'Entertainment',
    'Sports'
  ];

  return (
    <section className="py-4">
      <h2 className="text-xl font-semibold mb-3">Trending Topics</h2>
      <div className="flex flex-wrap gap-2">
        {trendingTopics.map((topic) => (
          <Link
            key={topic}
            href={`/search?q=${encodeURIComponent(topic)}`}
            className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {topic}
          </Link>
        ))}
      </div>
    </section>
  );
}
