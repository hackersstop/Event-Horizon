
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Users, Info } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500 ease-out">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Manage Users</CardTitle>
          </div>
          <CardDescription>Oversee user accounts, roles, and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Users className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <p className="text-2xl font-semibold text-muted-foreground mb-2">User Management Features Coming Soon!</p>
            <p className="text-md text-muted-foreground max-w-xl mx-auto mb-6">
              This section will allow administrators to view user details, manage roles, and oversee event participation. 
              Key information such as user email, booking history, and potentially phone numbers (if provided by users and stored) will be accessible here.
            </p>
            <div className="mt-4 p-4 bg-muted/50 border border-dashed rounded-lg max-w-lg mx-auto text-sm">
                <div className="flex items-start text-muted-foreground">
                    <Info className="h-5 w-5 mr-2 mt-0.5 shrink-0"/>
                    <span>
                        <strong>Note:</strong> Comprehensive user listing and management typically requires backend integration (e.g., Firebase Admin SDK via Cloud Functions) to securely access and modify all user data beyond the currently authenticated admin. Phone numbers are not collected by default through Google Sign-In and would require a separate user profile update mechanism.
                    </span>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
