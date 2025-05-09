import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "../types";
import { updateUserPreferences, getUserPreferences } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../hooks/useAuth";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

export default function Profile() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile states
  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [theme, setTheme] = useState("system");
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/");
      toast({
        title: "Authentication required",
        description: "Please sign in to view your profile.",
        variant: "destructive",
      });
      return;
    }
    
    // Set document title
    document.title = "Your Profile - GlobalNews";
    
    // Load user settings
    if (user && !isLoading) {
      setIsLoading(true);
      
      setDisplayName(userProfile?.displayName || user.displayName || "");
      setPreferredLanguage(userProfile?.preferredLanguage || "en");
      
      // Simulate getting user preferences
      setTimeout(() => {
        setPreferredCategories(["business", "technology", "sports"]);
        setTheme("system");
        setIsLoading(false);
      }, 500);
    }
  }, [navigate, toast, user, userProfile, authLoading]);
  
  const saveProfileSettings = async () => {
    setIsLoading(true);
    try {
      await updateUserPreferences({
        displayName,
        preferredLanguage,
        preferredCategories,
        theme,
      });
      
      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleCategory = (categoryId: string) => {
    setPreferredCategories((prevCategories) => {
      if (prevCategories.includes(categoryId)) {
        return prevCategories.filter((id) => id !== categoryId);
      } else {
        return [...prevCategories, categoryId];
      }
    });
  };
  
  const handleLogout = () => {
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };
  
  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-xl">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-white dark:bg-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white text-lg">
                    {user.displayName ? user.displayName.charAt(0) : 
                     user.email ? user.email.charAt(0) : "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.displayName || user.email?.split('@')[0]}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/bookmarks")}>
                  Bookmarks
                </Button>
                <Button variant="ghost" className="w-full justify-start text-neutral-700 dark:text-neutral-300">
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start text-neutral-700 dark:text-neutral-300">
                  Account Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile">
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        className="mt-1 bg-neutral-50 dark:bg-neutral-700"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={saveProfileSettings}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences">
                  <div className="space-y-4">
                    <div>
                      <Label>Preferred Language</Label>
                      <Select
                        value={preferredLanguage}
                        onValueChange={setPreferredLanguage}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Articles will be automatically translated to this language
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Label className="mb-2 block">Preferred Categories</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => toggleCategory(category.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              preferredCategories.includes(category.id)
                                ? "bg-primary text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Select categories you're interested in for a personalized news feed
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={saveProfileSettings}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {isLoading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance">
                  <div className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <Select
                        value={theme}
                        onValueChange={setTheme}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={saveProfileSettings}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {isLoading ? "Saving..." : "Save Appearance"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}