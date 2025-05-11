
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, ShieldAlert, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { isAdmin, signInWithEmail, loading, user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading) { // Only proceed if AuthContext is not loading
      if (user) { // User is logged in
        if (isAdmin) {
          // If admin is logged in (possibly from a previous session or just now)
          // and is on the admin login page, redirect to dashboard.
          // This is largely handled by AuthContext, but this is a safeguard.
          if (pathname === '/admin/login') {
            router.push('/admin/dashboard');
          }
        } else {
          // User is logged in, but IS NOT ADMIN.
          // This means they used the admin login form but are not an admin.
          // Or a non-admin user navigated directly to /admin/login.
          if (pathname === '/admin/login') { // Action specific to admin login page
            toast({
              title: "Access Denied",
              description: "You are not authorized to access the admin panel. Please log in with admin credentials.",
              variant: "destructive"
            });
            // Sign out the user to prevent session confusion.
            // signOut will trigger onAuthStateChanged, which will keep them on /admin/login (now as a logged-out user).
            signOut().catch(err => console.error("Error signing out non-admin from admin login:", err));
          }
        }
      }
      // If !user && !loading, they are on login page, ready to log in (expected state).
    }
  }, [user, isAdmin, loading, router, toast, signOut, pathname]);


  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(data.email, data.password);
      // If login is successful & user is admin, AuthContext will redirect.
      // If login is successful & user is NOT admin, the useEffect above will toast "Access Denied" and sign out.
      // If login fails (e.g. wrong password), signInWithEmail in AuthContext will toast "Login Failed".
      // No "Login Successful" toast here to avoid premature/misleading messages.
    } catch (error: any) {
      // This catch is for errors re-thrown by signInWithEmail (e.g. auth failures handled there)
      // or other unexpected errors during the submission process.
      // The toast for auth failure is already in AuthContext's signInWithEmail.
      console.error("Admin login form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || (user && isAdmin)) { // Show spinner if auth is loading OR if user is admin (implies redirect is imminent)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  // If user is logged in but NOT admin, the useEffect will handle toast and sign-out.
  // During that brief period, we might still render the form or a spinner. A spinner is better.
  if (user && !isAdmin && !loading && pathname === '/admin/login') {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }


  // Render login form if no user, or if user is not admin and useEffect hasn't kicked in fully (though spinner above should catch most)
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-md pt-1">
            Please login to manage {siteConfig.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isSubmitting ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center space-y-2">
           <Link href="/" className="text-sm text-primary hover:underline flex items-center">
            <Home className="h-4 w-4 mr-1" /> Go to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

