
import React from 'react';
import { CourseCard } from './CourseCard';
import { Course } from '@/data/coursesData';

interface CourseGridProps {
  courses: Course[];
  isAuthenticated: boolean;
  onCourseAction: (course: Course) => void;
}

export function CourseGrid({ courses, isAuthenticated, onCourseAction }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isAuthenticated={isAuthenticated}
          onCourseAction={onCourseAction}
        />
      ))}
    </div>
  );
}
