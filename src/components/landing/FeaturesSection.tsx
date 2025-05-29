
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function FeaturesSection() {
  const features = [
    {
      title: "Beginner: Crypto Basics & Wallets",
      description: "Step-by-step lessons that break down complex trading concepts into digestible, actionable insights.",
      icon: "📚"
    },
    {
      title: "Intermediate: Technical Analysis Foundations",
      description: "Hands-on exercises, quizzes, and simulations to practice without risking real money.",
      icon: "🎮"
    },
    {
      title: "Advanced: Trade Like a Pro",
      description: "Integrated charting tools to analyze markets and apply what you've learned immediately.",
      icon: "📊"
    },
    {
      title: "Community Support",
      description: "Connect with fellow learners, share strategies, and get answers from experienced traders.",
      icon: "🤝"
    }
  ];

  return (
    <section id="features" className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Choose Your Learning Path
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We've built the most comprehensive yet beginner-friendly crypto trading education platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
