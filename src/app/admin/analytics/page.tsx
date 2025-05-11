
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
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
            <BarChart3 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Event Analytics</CardTitle>
          </div>
          <CardDescription>Track event performance, sales, and user engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <BarChart3 className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <p className="text-2xl font-semibold text-muted-foreground mb-2">Analytics Dashboard Coming Soon!</p>
            <p className="text-md text-muted-foreground max-w-md mx-auto">
              Detailed charts, reports, and insights into your event's success will be available here. 
              Stay tuned for powerful data visualizations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
