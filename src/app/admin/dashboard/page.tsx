'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { PlusCircle, Settings, ScanLine, BarChart3, Users, Ticket } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function AdminDashboardPage() {
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
  
  const adminActions = [
    { title: "Add New Event", href: "/admin/events/add", icon: PlusCircle, description: "Create and publish new events." },
    { title: "Manage Events", href: "/admin/events", icon: Ticket, description: "Edit or remove existing events." },
    { title: "System Settings", href: "/admin/settings", icon: Settings, description: "Configure payment and email settings." },
    { title: "Scan Tickets", href: "/admin/scan", icon: ScanLine, description: "Verify event tickets using QR codes." },
    { title: "View Analytics", href: "/admin/analytics", icon: BarChart3, description: "Track event performance and sales." },
    { title: "Manage Users", href: "/admin/users", icon: Users, description: "Oversee user accounts and roles." },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome, {user.displayName || user.email}! Manage {siteConfig.name} from here.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminActions.map((action) => (
          <Card key={action.href} className="hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
            <CardHeader className="flex-row items-center space-x-4 pb-2">
               <action.icon className="h-10 w-10 text-primary" />
               <div>
                <CardTitle className="text-xl font-semibold">{action.title}</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Link href={action.href}>Go to {action.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
