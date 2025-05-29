import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Beginner-Friendly Courses",
      description: "Step-by-step lessons that break down complex trading concepts into digestible, actionable insights.",
      icon: "📚"
    },
    {
      title: "Interactive Learning",
      description: "Hands-on exercises, quizzes, and simulations to practice without risking real money.",
      icon: "🎮"
    },
    {
      title: "Real-time Charts",
      description: "Integrated charting tools to analyze markets and apply what you've learned immediately.",
      icon: "📊"
    },
    {
      title: "Community Support",
      description: "Connect with fellow learners, share strategies, and get answers from experienced traders.",
      icon: "🤝"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "New Trader",
      content: "SugarTrades made crypto trading finally click for me. The lessons are so well structured!",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Student",
      content: "I went from knowing nothing about crypto to making my first successful trades in just 2 weeks.",
      avatar: "MR"
    },
    {
      name: "Alex Kim",
      role: "Professional",
      content: "Even as someone with finance background, I learned new strategies I never considered before.",
      avatar: "AK"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <Badge variant="secondary" className="mb-4">
            🧪 Now in Beta – Join Our First 500 Founding Learners
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Master Crypto Trading From Scratch—The{' '}
            <span className="text-primary">Smart, Sweet, and Simple Way</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From complete beginner to confident trader. Our gamified platform makes cryptocurrency trading education fun, safe, and incredibly effective.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-8">
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            ✨ No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Start Trading
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

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Thousands of Learners
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about their trading journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <p className="mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your learning journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">Free</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ 5 beginner courses</li>
                <li>✓ Basic community access</li>
                <li>✓ Mobile app</li>
                <li>✗ Advanced strategies</li>
                <li>✗ Live trading sessions</li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-primary">
            <CardContent className="p-6">
              <Badge className="mb-2">Most Popular</Badge>
              <h3 className="font-semibold text-lg mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ All courses & content</li>
                <li>✓ Advanced strategies</li>
                <li>✓ Live trading sessions</li>
                <li>✓ Priority community support</li>
                <li>✓ Chart analysis tools</li>
              </ul>
              <Button className="w-full">
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Everything in Pro</li>
                <li>✓ 1-on-1 mentoring</li>
                <li>✓ Custom learning paths</li>
                <li>✓ API access</li>
                <li>✓ White-label options</li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful traders who started their journey with SugarTrades.io
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>
            Start Learning Today - It's Free!
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
