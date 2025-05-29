
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> [Insert Date]
          </p>
          
          <p className="mb-6">
            At SugarTrades.io, your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Collect</h2>
          <p className="mb-4">We may collect:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Your name, email address, and account credentials</li>
            <li>Learning progress, quiz results, and site activity</li>
            <li>Payment information (processed securely via Stripe or similar providers)</li>
            <li>Device, IP, browser type, and analytics data</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Info</h2>
          <p className="mb-4">We use your data to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Create and manage your account</li>
            <li>Deliver personalized education content</li>
            <li>Improve our services and user experience</li>
            <li>Send essential notifications and updates</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing</h2>
          <p className="mb-4">We do not sell your data. We may share limited data with:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Third-party processors (e.g., payment, email, analytics providers)</li>
            <li>Legal authorities, only when required by law</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
          <p className="mb-4">We use cookies and similar tools to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Maintain your login session</li>
            <li>Track course progress and site usage</li>
            <li>Improve marketing and performance</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p className="mb-4">You can:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Access or update your personal data</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of emails at any time</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
          <p className="mb-6">
            Questions? Contact us at{' '}
            <a href="mailto:hello@sugartrades.io" className="text-primary hover:underline">
              hello@sugartrades.io
            </a>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
