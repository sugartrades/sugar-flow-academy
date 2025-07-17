
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Settings, Crown, Activity, TestTube, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XRPLMonitoringDashboard } from '@/components/admin/XRPLMonitoringDashboard';
import { XRPLTestSuite } from '@/components/admin/XRPLTestSuite';
import { EmailTestSuite } from '@/components/admin/EmailTestSuite';
import DestinationTagTestSuite from '@/components/admin/DestinationTagTestSuite';

type AppRole = 'super_admin' | 'admin' | 'moderator' | 'user';
type MembershipTier = 'free' | 'advanced' | 'pro';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: AppRole;
}

interface UserMembership {
  id: string;
  user_id: string;
  tier: MembershipTier;
  granted_at: string;
  granted_by: string | null;
  expires_at: string | null;
  is_purchased: boolean;
  user_name: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user has the required role
  const hasRole = (requiredRole: AppRole) => {
    if (!userRole) return false;
    const roleHierarchy: Record<AppRole, number> = {
      'user': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  // Check authentication and authorization
  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
      fetchMemberships();
    }
  }, [isAuthorized]);

  const checkAdminAccess = async () => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', session);
      if (!session) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to access the admin area",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      console.log('User ID:', session.user.id);

      // Get user's role
      const { data, error } = await supabase.rpc('get_current_user_role');
      console.log('Role check result:', { data, error });
      if (error) {
        console.error('Error checking user role:', error);
        toast({
          title: "Access Denied",
          description: "Unable to verify admin privileges",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserRole(data);

      // Check if user has admin or super_admin role
      if (data !== 'admin' && data !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        title: "Access Denied",
        description: "Unable to verify admin privileges",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          user_roles!inner(role)
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
        return;
      }

      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        email: '',
        full_name: profile.full_name || 'Unknown',
        created_at: '',
        role: (profile.user_roles as any)[0]?.role as AppRole || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          *,
          profiles!user_memberships_user_id_fkey(full_name)
        `);

      if (error) {
        console.error('Error fetching memberships:', error);
        toast({
          title: "Error",
          description: "Failed to fetch memberships",
          variant: "destructive"
        });
        return;
      }

      const formattedMemberships = data?.map(membership => ({
        ...membership,
        user_name: (membership.profiles as any)?.full_name || 'Unknown User'
      })) || [];

      setMemberships(formattedMemberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast({
        title: "Error",
        description: "Failed to fetch memberships",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const roleToAssign = newRole as AppRole;
      
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: roleToAssign 
        });

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const updateMembershipTier = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('user_memberships')
        .update({ 
          tier: newTier as MembershipTier,
          granted_at: new Date().toISOString(),
          is_purchased: false // Since admin is granting it
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating membership:', error);
        toast({
          title: "Error",
          description: "Failed to update membership tier",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Membership tier updated successfully"
      });

      fetchMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      toast({
        title: "Error",
        description: "Failed to update membership tier",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500 text-white';
      case 'admin':
        return 'bg-orange-500 text-white';
      case 'moderator':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-purple-500 text-white';
      case 'advanced':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showAuth={false} />
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <Header showAuth={false} />
        <div className="container py-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this area.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={false} />
      
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-emerald-500" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, roles, and memberships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
              </div>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'moderator').length}
              </div>
              <p className="text-sm text-muted-foreground">Moderators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {memberships.filter(m => m.tier === 'pro' || m.tier === 'advanced').length}
              </div>
              <p className="text-sm text-muted-foreground">Premium Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roles">User Roles</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="monitoring">XRPL Monitoring</TabsTrigger>
            <TabsTrigger value="testing">Test Suite</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>User Role Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.full_name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        {hasRole('super_admin') && (
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memberships">
            <Card>
              <CardHeader>
                <CardTitle>Membership Management</CardTitle>
                <CardDescription>
                  Grant membership tiers to users as perks for early adopters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {membership.user_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{membership.user_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {membership.is_purchased ? 'Purchased' : 'Granted'} • 
                            {new Date(membership.granted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getMembershipBadgeColor(membership.tier)}>
                          {membership.tier.toUpperCase()}
                        </Badge>
                        
                        {hasRole('admin') && (
                          <Select
                            value={membership.tier}
                            onValueChange={(newTier) => updateMembershipTier(membership.user_id, newTier)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <XRPLMonitoringDashboard />
          </TabsContent>

          <TabsContent value="testing">
            <div className="space-y-6">
              <EmailTestSuite />
              <XRPLTestSuite />
              <DestinationTagTestSuite />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
