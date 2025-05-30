
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthTabs } from '@/components/auth/AuthTabs';

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container max-w-md mx-auto py-24">
        <AuthTabs />
      </div>
    </div>
  );
}
