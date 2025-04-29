import { Link } from "wouter";

const TRENDING_TOPICS = [
  { id: "ai", name: "#ArtificialIntelligence" },
  { id: "climate", name: "#ClimateAction" },
  { id: "economy", name: "#EconomicOutlook" },
  { id: "healthcare", name: "#HealthcareInnovation" },
  { id: "sports", name: "#WorldCup" },
  { id: "tech", name: "#TechInnovation" },
];

export default function TrendingTopics() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Trending Topics</h2>
      
      <div className="flex flex-wrap gap-3">
        {TRENDING_TOPICS.map((topic) => (
          <Link key={topic.id} href={`/search?q=${encodeURIComponent(topic.name.substring(1))}`}>
            <a className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-full shadow-apple dark:shadow-apple-dark text-neutral-800 dark:text-neutral-100 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              {topic.name}
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
