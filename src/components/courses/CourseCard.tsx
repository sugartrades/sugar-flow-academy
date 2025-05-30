
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { Course } from '@/data/coursesData';

interface CourseCardProps {
  course: Course;
  isAuthenticated: boolean;
  onCourseAction: (course: Course) => void;
}

export function CourseCard({ course, isAuthenticated, onCourseAction }: CourseCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${!isAuthenticated ? 'opacity-75' : ''}`}>
      <CardHeader>
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
