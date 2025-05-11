'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AddEventForm } from '@/components/admin/AddEventForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PlusCircle } from 'lucide-react';

export default function AddEventPage() {
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
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Add New Event</CardTitle>
          </div>
          <CardDescription>Fill in the details below to create a new event.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddEventForm />
        </CardContent>
      </Card>
    </div>
  );
}
