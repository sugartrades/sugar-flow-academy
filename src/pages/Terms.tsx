
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> [Insert Date]
          </p>
          
          <p className="mb-6">
            By using SugarTrades.io, you agree to the following terms. Please read them carefully.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Platform</h2>
          <p className="mb-6">
            You must be at least 18 years old to use this site. You agree not to misuse our platform or attempt unauthorized access.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Educational Purpose Only</h2>
          <p className="mb-6">
            All content is for educational purposes only and does not constitute investment advice. You are solely responsible for your trading decisions.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Security</h2>
          <p className="mb-6">
            Keep your login credentials secure. You're responsible for any activity that occurs under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payments & Refunds</h2>
          <p className="mb-6">
            Free trials are available. For paid plans, billing is monthly or annually. You may cancel anytime. Refunds are not guaranteed and are issued at our discretion.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p className="mb-6">
            All platform content—including text, videos, and tools—is owned by SugarTrades.io and may not be reused or distributed without permission.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
          <p className="mb-6">
            We may suspend or terminate your account if you violate these terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="mb-6">
            SugarTrades.io is not liable for any loss incurred as a result of trading decisions made using information or tools from the platform.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
