
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function TestimonialsSection() {
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
  );
}
