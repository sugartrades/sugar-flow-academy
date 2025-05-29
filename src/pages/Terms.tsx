
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">SugarTrades.io Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> May 29, 2025
          </p>
          
          <p className="mb-6">
            Welcome to SugarTrades.io ("we," "our," or "us"). By accessing or using our website and services, you agree to the following Terms of Service. If you do not agree with these terms, please do not use the platform.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Eligibility</h2>
          <p className="mb-6">
            You must be at least 18 years old to use SugarTrades.io. By using the platform, you represent that you meet this requirement.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Account Registration</h2>
          <p className="mb-6">
            You agree to provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Educational Purpose Only</h2>
          <p className="mb-6">
            All content on SugarTrades.io is provided for educational purposes only. Nothing on the site constitutes investment advice or a recommendation to buy or sell any financial asset.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payments and Subscriptions</h2>
          <p className="mb-6">
            Some features require a paid subscription. All payments are processed securely by third-party providers. Subscriptions may renew automatically unless canceled. Refunds are not guaranteed and will be considered on a case-by-case basis.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Use the platform for any unlawful or fraudulent purpose</li>
            <li>Attempt to gain unauthorized access to any systems or data</li>
            <li>Share, distribute, or resell content without permission</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p className="mb-6">
            All content, including courses, branding, and software, is the property of SugarTrades.io or its licensors. You may not reproduce, copy, or exploit any part of the site without express permission.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
          <p className="mb-6">
            We reserve the right to suspend or terminate your account at our discretion, particularly for violations of these terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers and Limitation of Liability</h2>
          <p className="mb-6">
            SugarTrades.io is provided "as is" and "as available." We do not guarantee that the platform will be error-free or uninterrupted. We are not liable for any losses arising from the use of our services or content.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to These Terms</h2>
          <p className="mb-6">
            We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes your acceptance of the revised terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
          <p className="mb-6">
            These terms are governed by the laws of the United States. Any disputes shall be resolved in the appropriate jurisdiction.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-6">
            For questions or concerns about these Terms, contact:{' '}
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
