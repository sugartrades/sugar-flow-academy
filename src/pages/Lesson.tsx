
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function Lesson() {
  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

  const lesson = {
    title: "Understanding Support and Resistance",
    course: "Technical Analysis Mastery",
    progress: 60,
    sections: [
      {
        type: "content",
        title: "What is Support and Resistance?",
        content: `Support and resistance are fundamental concepts in technical analysis that help traders identify potential price levels where an asset might reverse direction.

**Support** is a price level where a downtrend can be expected to pause due to a concentration of demand. It's like a "floor" that prevents the price from falling further.

**Resistance** is a price level where an uptrend can be expected to pause due to a concentration of supply. It's like a "ceiling" that prevents the price from rising higher.

These levels are created by the psychology of market participants and their previous trading decisions at certain price points.`
      },
      {
        type: "video",
        title: "Support and Resistance in Action",
        videoId: "dQw4w9WgXcQ", // Placeholder
        content: "Watch this video to see real examples of support and resistance levels on actual Bitcoin charts."
      },
      {
        type: "quiz",
        title: "Test Your Knowledge",
        question: "What happens when price breaks below a support level?",
        options: [
          "The support becomes resistance",
          "The price will always reverse immediately",
          "Support levels become stronger",
          "Nothing changes"
        ],
        correct: 0,
        explanation: "When price breaks below support, that level often becomes resistance on future price movements up to that level."
      }
    ]
  };

  const currentSectionData = lesson.sections[currentSection];

  const nextSection = () => {
    if (currentSection < lesson.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Lesson complete
      navigate('/courses');
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderContent = () => {
    switch (currentSectionData.type) {
      case 'content':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-foreground leading-relaxed">
              {currentSectionData.content}
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎥</div>
                <p className="text-muted-foreground">Video Player Placeholder</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentSectionData.content}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <QuizSection
            question={currentSectionData.question}
            options={currentSectionData.options}
            correct={currentSectionData.correct}
            explanation={currentSectionData.explanation}
            onComplete={nextSection}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{lesson.course}</span>
            <span>•</span>
            <span>Lesson {currentSection + 1} of {lesson.sections.length}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <Progress value={(currentSection / lesson.sections.length) * 100} className="w-full" />
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{currentSectionData.title}</h2>
              <Badge variant="secondary" className="mb-4">
                {currentSectionData.type.charAt(0).toUpperCase() + currentSectionData.type.slice(1)}
              </Badge>
            </div>
            
            {renderContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevSection}
            disabled={currentSection === 0}
          >
            Previous
          </Button>
          
          <Button onClick={nextSection}>
            {currentSection === lesson.sections.length - 1 ? 'Complete Lesson' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuizSection({ question, options, correct, explanation, onComplete }: {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  onComplete: () => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{question}</h3>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showResult && setSelectedAnswer(index)}
            disabled={showResult}
            className={`w-full p-4 text-left border rounded-lg transition-colors ${
              showResult 
                ? index === correct 
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : index === selectedAnswer 
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200'
                : selectedAnswer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                showResult && index === correct
                  ? 'border-green-500 bg-green-500'
                  : showResult && index === selectedAnswer && index !== correct
                    ? 'border-red-500 bg-red-500'
                    : selectedAnswer === index
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
              }`}>
                {showResult && index === correct && <span className="text-white text-sm">✓</span>}
                {showResult && index === selectedAnswer && index !== correct && <span className="text-white text-sm">✗</span>}
                {!showResult && selectedAnswer === index && <span className="text-white text-sm">•</span>}
              </div>
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg ${
          selectedAnswer === correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            selectedAnswer === correct ? 'text-green-800' : 'text-red-800'
          }`}>
            {selectedAnswer === correct ? 'Correct!' : 'Incorrect'}
          </h4>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showResult ? (
          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleContinue}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
