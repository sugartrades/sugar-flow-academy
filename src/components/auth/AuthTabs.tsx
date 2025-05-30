
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function AuthTabs() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="forgot">Reset</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm loading={loading} setLoading={setLoading} />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignupForm loading={loading} setLoading={setLoading} />
      </TabsContent>
      
      <TabsContent value="forgot">
        <ForgotPasswordForm 
          loading={loading} 
          setLoading={setLoading} 
          setActiveTab={setActiveTab}
        />
      </TabsContent>
    </Tabs>
  );
}
