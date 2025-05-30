
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Cryptocurrency Fundamentals",
      description: "Learn the basics of blockchain, Bitcoin, and major cryptocurrencies",
      difficulty: "Beginner",
      duration: "2 hours",
      lessons: 12,
      enrolled: 1420,
      rating: 4.8,
      price: "Free"
    },
    {
      id: 2,
      title: "Technical Analysis Mastery",
      description: "Master chart patterns, indicators, and trading signals",
      difficulty: "Intermediate",
      duration: "4 hours",
      lessons: 18,
      enrolled: 890,
      rating: 4.9,
      price: "Pro"
    },
    {
      id: 3,
      title: "Risk Management Strategies",
      description: "Protect your capital with proven risk management techniques",
      difficulty: "Beginner",
      duration: "1.5 hours",
      lessons: 8,
      enrolled: 756,
      rating: 4.7,
      price: "Free"
    },
    {
      id: 4,
      title: "Advanced Trading Psychology",
      description: "Control emotions and develop a winning trader mindset",
      difficulty: "Advanced",
      duration: "3 hours",
      lessons: 15,
      enrolled: 423,
      rating: 4.9,
      price: "Pro"
    },
    {
      id: 5,
      title: "DeFi and Yield Farming",
      description: "Explore decentralized finance opportunities and strategies",
      difficulty: "Intermediate",
      duration: "2.5 hours",
      lessons: 10,
      enrolled: 612,
      rating: 4.6,
      price: "Pro"
    },
    {
      id: 6,
      title: "Portfolio Diversification",
      description: "Build a balanced crypto portfolio that minimizes risk",
      difficulty: "Beginner",
      duration: "1 hour",
      lessons: 6,
      enrolled: 934,
      rating: 4.5,
      price: "Free"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty.toLowerCase() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCourseAction = (course: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Authenticated user action - would navigate to course content
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
                <p className="font-medium">Sign up to access full course content and track your progress!</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters - disabled for non-authenticated users */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!user}
            />
          </div>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty} disabled={!user}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className={`hover:shadow-lg transition-shadow ${!user ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <Badge variant={course.price === 'Free' ? 'secondary' : 'default'}>
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
                    onClick={() => handleCourseAction(course)}
                    variant={!user ? "outline" : "default"}
                  >
                    {!user ? (
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Sign up to Access
                      </div>
                    ) : (
                      course.price === 'Free' ? 'Start Course' : 'Enroll Now'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
