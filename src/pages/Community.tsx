
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Crown, Medal, Award, Heart } from "lucide-react";

const Community = () => {
  const [newMessage, setNewMessage] = useState("");

  const leaderboard = [
    { rank: 1, name: "Sarah Chen", points: 2847, streak: 45, avatar: "SC", badge: "crown" },
    { rank: 2, name: "Miguel Rodriguez", points: 2654, streak: 32, avatar: "MR", badge: "medal" },
    { rank: 3, name: "Emma Thompson", points: 2431, streak: 28, avatar: "ET", badge: "award" },
    { rank: 4, name: "You", points: 1876, streak: 23, avatar: "YU", isCurrentUser: true },
    { rank: 5, name: "Akira Tanaka", points: 1654, streak: 19, avatar: "AT" },
  ];

  const messages = [
    {
      id: 1,
      user: "Sarah Chen",
      avatar: "SC",
      message: "Just finished Toy Story in Spanish! The vocabulary was perfect for beginners 🎬",
      time: "2m ago",
      likes: 12
    },
    {
      id: 2,
      user: "Miguel Rodriguez", 
      avatar: "MR",
      message: "Does anyone know where I can watch Finding Nemo with French subtitles?",
      time: "15m ago",
      likes: 5
    },
    {
      id: 3,
      user: "Emma Thompson",
      avatar: "ET", 
      message: "Tip: Use the 'Export to Anki' feature after each lesson. It's been a game changer for retention! 📚",
      time: "1h ago",
      likes: 23
    },
    {
      id: 4,
      user: "Akira Tanaka",
      avatar: "AT",
      message: "45-day streak achieved! This app makes learning so addictive 🔥",
      time: "2h ago", 
      likes: 18
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "crown": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "medal": return <Medal className="w-4 h-4 text-gray-400" />;
      case "award": return <Award className="w-4 h-4 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Community</h1>
          <p className="text-muted-foreground">Connect with fellow learners</p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {/* Messages */}
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <Card key={message.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">{message.user}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{message.message}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Heart className="w-4 h-4 mr-1" />
                          {message.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Message Input */}
            <Card className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Share your progress or ask for help..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {leaderboard.map((user) => (
              <Card 
                key={user.rank} 
                className={`p-4 ${user.isCurrentUser ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">
                    {user.rank}
                  </div>
                  
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={user.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"}>
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${user.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {user.name}
                      </span>
                      {user.badge && getBadgeIcon(user.badge)}
                      {user.isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{user.points.toLocaleString()} pts</span>
                      <span>{user.streak} day streak</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Keep learning to climb the leaderboard! 🚀
              </p>
              <Button variant="outline" size="sm">
                View Full Rankings
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
