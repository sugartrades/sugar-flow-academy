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
          <p className="text-muted-foreground">Choose your path to crypto trading mastery</p>
          
          {/* Course Access Levels Section */}
          <div className="mt-8 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">📚 Course Access Levels</h2>
            <p className="text-center text-muted-foreground mb-6">
              At SugarTrades.io, your learning path is divided into three tiers. Start free, level up with more advanced strategies, or unlock our most powerful training tools in Pro.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div className="bg-white p-5 rounded-lg border-2 border-green-200">
                <h3 className="text-lg font-bold mb-2 text-green-700">✅ Free Tier (Beginner)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Goal:</strong> Onboard and educate brand-new users with essential trading fundamentals.
                </p>
                <p className="text-sm font-medium mb-2">Includes:</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  <li>• Cryptocurrency Fundamentals</li>
                  <li>• Risk Management Strategies</li>
                  <li>• Portfolio Diversification</li>
                  <li>• Crypto Safety & Wallet Security</li>
                  <li>• Crypto Taxes 101</li>
                </ul>
                <div className="text-green-700 font-bold">🟢 5 Total Courses</div>
              </div>

              {/* Advanced Tier */}
              <div className="bg-white p-5 rounded-lg border-2 border-yellow-200">
                <h3 className="text-lg font-bold mb-2 text-yellow-700">🔶 Advanced Tier (Skill Builders)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Goal:</strong> Upskill users ready to go beyond basics with deeper strategies and market knowledge.
                </p>
                <p className="text-sm font-medium mb-2">Includes:</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  <li>• Mastering Market Sentiment</li>
                  <li>• Tokenomics & Project Due Diligence</li>
                  <li>• Reading the Blockchain: On-Chain Insights</li>
                  <li>• Advanced Trading Psychology</li>
                  <li>• Crypto in the Real World</li>
                </ul>
                <div className="text-yellow-700 font-bold">🟡 5 Total Courses</div>
              </div>

              {/* Pro Tier */}
              <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
                <h3 className="text-lg font-bold mb-2 text-purple-700">🔮 Pro Tier (Power Users)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Goal:</strong> Deliver elite-level content to our most serious traders.
                </p>
                <p className="text-sm font-medium mb-2">Includes:</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  <li>• Technical Analysis Mastery</li>
                  <li>• DeFi and Yield Farming</li>
                  <li>• Intro to Crypto Bots & Algorithmic Trading</li>
                </ul>
                <div className="text-purple-700 font-bold">🟣 3 Total Courses (expandable)</div>
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
