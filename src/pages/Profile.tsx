
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  Crown, 
  Languages, 
  Bell, 
  Moon, 
  Volume2,
  Download,
  Heart,
  LogOut,
  ChevronRight
} from "lucide-react";

const Profile = () => {
  const userStats = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    memberSince: "January 2024",
    totalPoints: 1876,
    streak: 23,
    completedMovies: 3,
    wordsLearned: 347,
    studyTime: "32h 15m"
  };

  const languages = [
    { name: "Spanish", level: "Intermediate", progress: 65 },
    { name: "French", level: "Beginner", progress: 30 },
    { name: "German", level: "Beginner", progress: 15 }
  ];

  const settings = [
    { icon: Bell, label: "Notifications", enabled: true },
    { icon: Moon, label: "Dark Mode", enabled: false },
    { icon: Volume2, label: "Sound Effects", enabled: true },
    { icon: Download, label: "Auto-download lessons", enabled: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your learning journey</p>
        </div>

        {/* User Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                AJ
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{userStats.name}</h2>
              <p className="text-sm text-muted-foreground">{userStats.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {userStats.memberSince}
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userStats.totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userStats.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Learning Stats */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Learning Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Movies Completed</span>
              <span className="font-semibold text-foreground">{userStats.completedMovies}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Words Learned</span>
              <span className="font-semibold text-foreground">{userStats.wordsLearned}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Study Time</span>
              <span className="font-semibold text-foreground">{userStats.studyTime}</span>
            </div>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Your Languages
          </h3>
          <div className="space-y-3">
            {languages.map((language, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{language.name}</div>
                  <div className="text-sm text-muted-foreground">{language.level}</div>
                </div>
                <Badge variant="outline">{language.progress}%</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Add New Language
          </Button>
        </Card>

        {/* Settings */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h3>
          <div className="space-y-4">
            {settings.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{setting.label}</span>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Rate Film Fluent
            </div>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Settings
            </div>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
