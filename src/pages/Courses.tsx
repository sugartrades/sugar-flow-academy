
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
                             course.difficulty.toLowerCase() === selectedDifficulty;
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
          <p className="text-muted-foreground">Choose your path to crypto trading mastery. The courses are divided into two main paths: Fundamental Analysis and Technical Analysis. Each path has three tiers: Beginner (Free), Advanced, and Pro.</p>
          
          {/* Learning Paths Section */}
          <div className="mt-8 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">📚 Learning Paths & Tiers</h2>
            <p className="text-center text-muted-foreground mb-6">
              Master crypto trading through two comprehensive learning paths. Each path is structured with progressive tiers to guide your journey from beginner to expert.
            </p>
            
            {/* Two Main Paths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Fundamental Analysis Path */}
              <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-xl font-bold mb-3 text-blue-700">📊 Fundamental Analysis Path</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn to evaluate cryptocurrencies based on their underlying value, technology, and market potential.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-700">Beginner (Free)</h4>
                    <p className="text-xs text-gray-600">Cryptocurrency basics, safety, and portfolio fundamentals</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-700">Advanced</h4>
                    <p className="text-xs text-gray-600">Tokenomics, project analysis, and market research</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                    <h4 className="font-semibold text-purple-700">Pro</h4>
                    <p className="text-xs text-gray-600">Advanced on-chain analysis and institutional strategies</p>
                  </div>
                </div>
              </div>

              {/* Technical Analysis Path */}
              <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                <h3 className="text-xl font-bold mb-3 text-purple-700">📈 Technical Analysis Path</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Master chart patterns, indicators, and trading psychology to time your market entries and exits.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-700">Beginner (Free)</h4>
                    <p className="text-xs text-gray-600">Risk management and trading psychology basics</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-700">Advanced</h4>
                    <p className="text-xs text-gray-600">Market sentiment analysis and advanced psychology</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                    <h4 className="font-semibold text-purple-700">Pro</h4>
                    <p className="text-xs text-gray-600">Technical analysis mastery and algorithmic trading</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Summary */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 text-center">🎯 Tier Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Beginner (Free) Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">5</div>
                  <div className="text-sm text-gray-600">Advanced Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">Pro Courses</div>
                </div>
              </div>
            </div>
          </div>

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
