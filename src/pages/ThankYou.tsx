import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowRight, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ThankYou() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/auth');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-green-600 fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Thank You! 🎉
            </h1>
            <p className="text-xl text-muted-foreground">
              Your tip has been received and greatly appreciated! Your support helps keep this service free for everyone.
            </p>
          </div>

          <Card className="mb-8 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-green-700">
                <Zap className="w-5 h-5" />
                What's Next?
              </CardTitle>
              <CardDescription>
                Get the most out of Whale Alert Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Join Our Community</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with other XRP traders and get exclusive insights
                  </p>
                  <Button onClick={handleSignUp} className="w-full">
                    Sign Up Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Start Monitoring</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access real-time whale alerts and trading insights
                  </p>
                  <Button onClick={handleDashboard} variant="outline" className="w-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-medium">
                  💡 Your tip helps us maintain 24/7 monitoring of whale wallets and keeps this service completely free for all traders!
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Questions or feedback? We'd love to hear from you!
            </p>
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}