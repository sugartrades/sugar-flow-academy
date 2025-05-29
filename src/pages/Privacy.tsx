
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">SugarTrades.io Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> May 29, 2025
          </p>
          
          <p className="mb-6">
            SugarTrades.io ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our website and services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Personal Information (e.g., name, email address, account credentials)</li>
            <li>Payment details (processed securely through third-party providers)</li>
            <li>Usage data (e.g., pages visited, time spent, progress through courses)</li>
            <li>Device and browser information</li>
            <li>Cookies and similar technologies to enhance user experience</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide access to our educational content and tools</li>
            <li>Personalize your learning experience</li>
            <li>Process payments and manage subscriptions</li>
            <li>Respond to customer support inquiries</li>
            <li>Improve our site and offerings</li>
            <li>Send transactional or marketing communications (with opt-out options)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing of Information</h2>
          <p className="mb-4">We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Third-party service providers (e.g., Supabase, Stripe, analytics tools)</li>
            <li>Legal authorities when required by law</li>
            <li>Affiliates and partners who assist in operating our services</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">
            We take appropriate measures to secure your information, including encryption and access control. However, no internet-based service is 100% secure.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Choices and Rights</h2>
          <p className="mb-4">You may:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Access or update your account information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing emails at any time</li>
            <li>Disable cookies in your browser (may affect functionality)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
          <p className="mb-6">
            SugarTrades.io is not intended for users under 18. We do not knowingly collect personal information from minors.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Third-Party Links</h2>
          <p className="mb-6">
            Our platform may contain links to third-party websites. We are not responsible for their content or privacy practices.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p className="mb-6">
            For any questions or concerns, contact us at:{' '}
            <a href="mailto:hello@sugartrades.io" className="text-primary hover:underline font-semibold">
              hello@sugartrades.io
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
