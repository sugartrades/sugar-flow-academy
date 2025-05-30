
import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MarketUpdate } from '@/components/MarketUpdate';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDailyTip } from '@/hooks/useDailyTip';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function Dashboard() {
  const { getDisplayName, loading: profileLoading } = useUserProfile();
  const { tip, loading: tipLoading } = useDailyTip();
  const { stats, loading: statsLoading } = useUserProgress();

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

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profileLoading ? 'Trader' : getDisplayName()}! 👋
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
                  <div className="text-2xl font-bold text-primary mb-2">
                    {statsLoading ? '...' : stats.totalXP.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">XP Points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {statsLoading ? '...' : stats.completedLessons}
                  </div>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {statsLoading ? '...' : stats.dayStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dynamic Tips and Updates Sidebar */}
          <div className="space-y-4">
            {/* Daily Tip */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">💡 Daily Tip</CardTitle>
              </CardHeader>
              <CardContent>
                {tipLoading ? (
                  <p className="text-sm">Loading tip...</p>
                ) : tip ? (
                  <p className="text-sm">{tip.content}</p>
                ) : (
                  <p className="text-sm">Always set stop-losses before entering any trade. This simple rule can save you from major losses.</p>
                )}
              </CardContent>
            </Card>

            {/* Real-time Market Update */}
            <MarketUpdate />

            {/* Today's Goal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🎯 Today's Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Complete the 'Support and Resistance' lesson to earn 50 XP points!
                </p>
              </CardContent>
            </Card>
            
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
