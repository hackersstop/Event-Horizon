
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
import { siteConfig } from '@/config/site';

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
    if (!loading) { 
      if (user) { 
        if (isAdmin) {
          if (pathname === '/admin/login') {
            router.push('/admin/dashboard');
          }
        } else {
          // This block handles users who are logged in but NOT admin.
          // This could be a regular user, or someone who used admin@gmail.com 
          // but their UID isn't in Firestore 'admins' (and Firestore was online).
          if (pathname === '/admin/login') { 
            toast({
              title: "Access Denied",
              description: "You are not authorized to access the admin panel. Ensure your account has admin privileges.",
              variant: "destructive"
            });
            // Sign out to prevent non-admin session on admin login page
            signOut().catch(err => console.error("Error signing out non-admin from admin login:", err));
          }
        }
      }
    }
  }, [user, isAdmin, loading, router, toast, signOut, pathname]);


  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    if (data.email.toLowerCase() !== siteConfig.adminEmail.toLowerCase()) {
      toast({
        title: "Access Denied",
        description: `Only ${siteConfig.adminEmail} is authorized for admin login.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(data.email, data.password);
      // AuthContext's onAuthStateChanged will handle redirection or further actions.
      // If login is successful & user is determined to be admin (by AuthContext), they'll be redirected.
      // If login is successful but user is determined NOT to be admin (e.g. Firestore check failed online),
      // the useEffect above will toast "Access Denied" and sign them out.
    } catch (error: any) {
      // signInWithEmail in AuthContext handles its own primary error toasts (e.g. wrong password).
      // This catch is for other unexpected issues or if signInWithEmail re-throws.
      // console.error("Admin login form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show spinner if auth is loading, or if user is admin (they will be redirected by useEffect).
  if (loading || (user && isAdmin)) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  // Show spinner if a non-admin user has just "logged in" via this form and is about to be signed out by useEffect.
  if (user && !isAdmin && !loading && pathname === '/admin/login') {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-md pt-1">
            Please login to manage {siteConfig.name}. <br /> Use {siteConfig.adminEmail} only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={siteConfig.adminEmail}
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

