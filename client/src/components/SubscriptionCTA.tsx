import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would typically make an API call to subscribe the user
      // For now, we'll just simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 mb-10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3 dark:text-white">Stay informed with our daily newsletter</h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">Get the day's top headlines delivered to your inbox every morning.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow py-3 px-4 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus-effect dark:bg-neutral-800 dark:border-neutral-700"
          />
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="btn-apple bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg shadow-sm"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
