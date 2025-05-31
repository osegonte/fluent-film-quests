
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, Calendar, Star, TrendingUp, BookOpen } from "lucide-react";

const ProgressPage = () => {
  const streakDays = 23;
  const totalWords = 347;
  const weeklyGoal = 5;
  const completedThisWeek = 3;

  // Heatmap data (7 days x 5 weeks)
  const heatmapData = [
    [2, 0, 1, 3, 2, 1, 0],
    [1, 2, 3, 1, 2, 0, 1],
    [3, 1, 2, 2, 1, 3, 2],
    [2, 3, 1, 0, 2, 1, 3],
    [1, 2, 0, 1, 3, 2, 1],
  ];

  const achievements = [
    { title: "First Movie", description: "Complete your first movie", earned: true, icon: Star },
    { title: "Week Warrior", description: "7-day learning streak", earned: true, icon: Flame },
    { title: "Vocab Master", description: "Learn 100 new words", earned: true, icon: BookOpen },
    { title: "Monthly Goal", description: "Complete monthly target", earned: false, icon: Target },
  ];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-muted";
    if (value === 1) return "bg-green-200 dark:bg-green-900";
    if (value === 2) return "bg-green-400 dark:bg-green-700";
    if (value === 3) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{streakDays}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalWords}</div>
            <div className="text-sm text-muted-foreground">Words Learned</div>
          </Card>
        </div>

        {/* Weekly Goal */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Weekly Goal</h3>
            <Badge variant={completedThisWeek >= weeklyGoal ? "default" : "secondary"}>
              {completedThisWeek}/{weeklyGoal}
            </Badge>
          </div>
          <Progress value={(completedThisWeek / weeklyGoal) * 100} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {weeklyGoal - completedThisWeek > 0 
              ? `${weeklyGoal - completedThisWeek} more lessons to reach your goal`
              : "Goal achieved! 🎉"
            }
          </p>
        </Card>

        {/* Learning Heatmap */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Learning Activity
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={day} className="text-xs text-muted-foreground text-center p-1">
                {day}
              </div>
            ))}
            {heatmapData.flat().map((value, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-sm ${getHeatmapColor(value)} border border-background`}
                title={`${value} lessons completed`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    achievement.earned
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      achievement.earned
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                  {achievement.earned && (
                    <Badge variant="default" className="text-xs">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Study Stats */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            This Month
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lessons Completed</span>
              <span className="font-semibold text-foreground">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Study Time</span>
              <span className="font-semibold text-foreground">8h 32m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">New Words</span>
              <span className="font-semibold text-foreground">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-semibold text-foreground">87%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
