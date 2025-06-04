
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Star, Clock, Users, Film, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const movies = [
  {
    id: "toy-story",
    title: "Toy Story",
    language: "Spanish",
    difficulty: "Beginner",
    duration: "18 min",
    progress: 65,
    scenes: 12,
    completedScenes: 8,
    poster: "/placeholder.svg",
    rating: 4.8,
    learners: "12.3k"
  },
  {
    id: "finding-nemo",
    title: "Finding Nemo", 
    language: "French",
    difficulty: "Intermediate",
    duration: "22 min",
    progress: 30,
    scenes: 15,
    completedScenes: 4,
    poster: "/placeholder.svg",
    rating: 4.9,
    learners: "8.7k"
  },
  {
    id: "shrek",
    title: "Shrek",
    language: "German",
    difficulty: "Advanced",
    duration: "25 min", 
    progress: 0,
    scenes: 18,
    completedScenes: 0,
    poster: "/placeholder.svg",
    rating: 4.7,
    learners: "5.2k"
  }
];

const Learn = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const languages = ["All", "Spanish", "French", "German", "Italian"];

  const filteredMovies = selectedLanguage === "All" 
    ? movies 
    : movies.filter(movie => movie.language === selectedLanguage);

  const handleStartLesson = (movieId: string) => {
    navigate(`/lesson/${movieId}/scene-1`);
  };

  const inProgressMovies = filteredMovies.filter(movie => movie.progress > 0);
  const hasActiveStreak = true; // Mock data for streak
  const currentStreak = 23;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-gray-950 dark:via-background dark:to-blue-950/50">
      <div className="container mx-auto px-4 py-6 max-w-md pb-24">
        {/* Enhanced Header with Dynamic Hero */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-headline text-foreground">
                🍿 Learn with Movies
              </h1>
              <p className="text-body mt-1">
                Master languages through cinema
              </p>
            </div>
            {hasActiveStreak && (
              <div className="flex items-center gap-2 px-3 py-2 bg-warning/20 rounded-full">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-warning">{currentStreak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Language Filter with better mobile UX */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {languages.map((language) => (
            <Button
              key={language}
              variant={selectedLanguage === language ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage(language)}
              className="whitespace-nowrap btn-mobile min-w-fit px-4"
            >
              {language}
            </Button>
          ))}
        </div>

        {/* Continue Learning Section with Enhanced Cards */}
        {inProgressMovies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-title mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Continue Learning
            </h2>
            <div className="space-y-4">
              {inProgressMovies.map((movie) => (
                <Card key={movie.id} className="mobile-card overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-24 bg-gradient-to-br from-primary/80 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                        <Film className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground mb-1">{movie.title}</h3>
                        <p className="text-caption mb-3">
                          {movie.language} • {movie.difficulty}
                        </p>
                        <div className="mb-3">
                          <div className="flex justify-between text-caption mb-1">
                            <span>{movie.completedScenes}/{movie.scenes} scenes</span>
                            <span>{movie.progress}%</span>
                          </div>
                          <div className="progress-enhanced">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${movie.progress}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleStartLesson(movie.id)}
                          className="w-full btn-mobile"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Movies with Enhanced Design */}
        <div>
          <h2 className="text-title mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Explore Movies
          </h2>
          <div className="space-y-4">
            {filteredMovies.map((movie) => (
              <Card key={movie.id} className="mobile-card overflow-hidden group">
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-gradient-to-br from-primary/80 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Film className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-title text-foreground truncate pr-2">{movie.title}</h3>
                        <div className="flex items-center gap-1 text-caption flex-shrink-0">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="font-medium">{movie.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {movie.language}
                        </Badge>
                        <Badge variant={
                          movie.difficulty === "Beginner" ? "default" : 
                          movie.difficulty === "Intermediate" ? "secondary" : "outline"
                        } className="text-xs">
                          {movie.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-caption mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {movie.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {movie.learners}
                        </div>
                      </div>

                      {movie.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-caption mb-1">
                            <span>{movie.completedScenes}/{movie.scenes} scenes</span>
                            <span>{movie.progress}%</span>
                          </div>
                          <div className="progress-enhanced">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${movie.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleStartLesson(movie.id)}
                        className="w-full btn-mobile group-hover:scale-[1.02] transition-transform"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {movie.progress > 0 ? "Continue Learning" : "🎬 Start Watching"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sticky Progress Footer */}
        {inProgressMovies.length > 0 && (
          <div className="sticky-progress">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">{currentStreak}-day streak</span>
              </div>
              <div className="text-caption">
                {inProgressMovies.length} lesson{inProgressMovies.length !== 1 ? 's' : ''} in progress
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
