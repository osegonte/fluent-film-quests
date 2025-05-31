
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Star, Clock, Users } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Learn with Movies
          </h1>
          <p className="text-muted-foreground">
            Master languages through your favorite films
          </p>
        </div>

        {/* Language Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {languages.map((language) => (
            <Button
              key={language}
              variant={selectedLanguage === language ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage(language)}
              className="whitespace-nowrap"
            >
              {language}
            </Button>
          ))}
        </div>

        {/* Continue Learning Section */}
        {movies.some(movie => movie.progress > 0) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Continue Learning</h2>
            {filteredMovies
              .filter(movie => movie.progress > 0)
              .map((movie) => (
                <Card key={movie.id} className="p-4 mb-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Film className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{movie.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {movie.language} • {movie.difficulty}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={movie.progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground">{movie.progress}%</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartLesson(movie.id)}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* All Movies */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Explore Movies</h2>
          <div className="space-y-4">
            {filteredMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className="w-20 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Film className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground">{movie.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {movie.rating}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{movie.language}</Badge>
                        <Badge variant={movie.difficulty === "Beginner" ? "default" : movie.difficulty === "Intermediate" ? "secondary" : "outline"}>
                          {movie.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
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
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{movie.completedScenes}/{movie.scenes} scenes</span>
                            <span>{movie.progress}%</span>
                          </div>
                          <Progress value={movie.progress} className="h-2" />
                        </div>
                      )}

                      <Button
                        onClick={() => handleStartLesson(movie.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {movie.progress > 0 ? "Continue" : "Start Learning"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
