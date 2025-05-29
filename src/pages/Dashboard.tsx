import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function Dashboard() {
  const { getDisplayName, loading } = useUserProfile();

  const courses = [
    {
      title: "Crypto Basics",
      progress: 75,
      lessons: "8/12 lessons",
      difficulty: "Beginner"
    },
    {
      title: "Technical Analysis",
      progress: 30,
      lessons: "3/10 lessons", 
      difficulty: "Intermediate"
    },
    {
      title: "Risk Management",
      progress: 0,
      lessons: "0/8 lessons",
      difficulty: "Beginner"
    }
  ];

  const dailyTips = [
    {
      title: "💡 Daily Tip",
      content: "Always set stop-losses before entering any trade. This simple rule can save you from major losses."
    },
    {
      title: "📊 Market Update",
      content: "Bitcoin is showing strong support at $42,000. Consider this level for your analysis."
    },
    {
      title: "🎯 Today's Goal",
      content: "Complete the 'Support and Resistance' lesson to earn 50 XP points!"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {loading ? 'Trader' : getDisplayName()}! 👋
          </h1>
          <p className="text-muted-foreground">Ready to continue your crypto trading journey?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Progress</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{course.title}</h3>
                        <Badge variant="secondary">{course.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.lessons}</p>
                      <Progress value={course.progress} className="w-full" />
                    </div>
                    <Button className="ml-4">
                      {course.progress === 0 ? 'Start' : 'Continue'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">1,250</div>
                  <p className="text-sm text-muted-foreground">XP Points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">12</div>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">7</div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Daily Tips Sidebar */}
          <div className="space-y-4">
            {dailyTips.map((tip, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{tip.content}</p>
                </CardContent>
              </Card>
            ))}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Join 500+ active traders discussing today's markets.</p>
                <Button variant="outline" className="w-full">
                  Join Discussion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
