
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { Course } from '@/data/coursesData';

interface CourseCardProps {
  course: Course;
  isAuthenticated: boolean;
  onCourseAction: (course: Course) => void;
}

export function CourseCard({ course, isAuthenticated, onCourseAction }: CourseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'all levels': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!isAuthenticated ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
          <Badge 
            variant={course.price === 'Free' ? 'secondary' : 'default'}
            className={course.price === 'Pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
          >
            {course.price === 'Pro' && <Crown className="h-3 w-3 mr-1" />}
            {course.price}
          </Badge>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{course.lessons} lessons</span>
            <span>{course.duration}</span>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{course.enrolled.toLocaleString()} enrolled</span>
            <span>⭐ {course.rating}</span>
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => onCourseAction(course)}
            variant={!isAuthenticated ? "outline" : course.price === 'Pro' ? "default" : "default"}
          >
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Sign up to Access
              </div>
            ) : course.price === 'Pro' ? (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Upgrade to Access
              </div>
            ) : (
              'Start Course'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
