
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { courses, Course } from '@/data/coursesData';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { CourseGrid } from '@/components/courses/CourseGrid';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             course.difficulty.toLowerCase() === selectedDifficulty ||
                             (selectedDifficulty === 'all levels' && course.difficulty === 'All Levels');
    return matchesSearch && matchesDifficulty;
  });

  const handleCourseAction = (course: Course) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if course requires upgrade
    if (course.price === 'Pro') {
      // Mock check for user subscription - for now, always show upgrade prompt
      navigate('/pricing');
      return;
    }
    
    // Free course - would navigate to course content
    console.log('Starting course:', course.title);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Course Directory</h1>
          <p className="text-muted-foreground">Choose your path to crypto trading mastery</p>
          {!user && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <Lock className="h-4 w-4" />
                <p className="font-medium">
                  <button 
                    onClick={() => navigate('/auth')}
                    className="underline hover:no-underline font-semibold text-amber-900"
                  >
                    Sign up
                  </button>
                  {' '}to access full course content and track your progress!
                </p>
              </div>
            </div>
          )}
        </div>

        <CourseFilters
          searchTerm={searchTerm}
          selectedDifficulty={selectedDifficulty}
          onSearchChange={setSearchTerm}
          onDifficultyChange={setSelectedDifficulty}
          isAuthenticated={!!user}
        />

        <CourseGrid
          courses={filteredCourses}
          isAuthenticated={!!user}
          onCourseAction={handleCourseAction}
        />
      </div>
    </div>
  );
}
