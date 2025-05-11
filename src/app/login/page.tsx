
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { LogIn, UserPlus, Home } from 'lucide-react'; // Assuming UserPlus for general login icon if no Google icon from Lucide
import Link from 'next/link';
import { siteConfig } from '@/config/site';

// Simple Google Icon SVG as Lucide doesn't have one
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" className="mr-2">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.001-0.001l6.19,5.238C39.902,35.688,44,30.478,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user && !loading) {
      router.push(redirect);
    }
  }, [user, loading, router, redirect]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LogIn className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }
  
  if (user) return null; // Or a message "You are already logged in."

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent leading-tight">
            Login to {siteConfig.name}
          </CardTitle>
          <CardDescription className="text-md pt-1">
            Access your bookings and manage your event experiences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={signInWithGoogle} 
            className="w-full text-lg py-6 bg-card border border-primary/50 hover:bg-primary/10 group"
            variant="outline"
          >
            <GoogleIcon />
            <span className="group-hover:text-primary transition-colors">Sign in with Google</span>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Admin? <Link href="/admin/login" className="font-medium text-primary hover:underline">Login here</Link>
          </p>
           <Link href="/" className="text-sm text-primary hover:underline flex items-center">
            <Home className="h-4 w-4 mr-1" /> Go to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

