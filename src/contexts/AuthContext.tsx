
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site'; // Import siteConfig

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const performSignOut = useCallback(async () => {
    setLoading(true); // Ensure loading state covers sign out process
    try {
      await firebaseSignOut(auth);
      // setUser, setIsAdmin will be updated by onAuthStateChanged to null/false.
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      // Redirection after sign-out is handled by onAuthStateChanged's effect on `user` state.
      // Specifically, if on a protected page, it will redirect.
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not sign out." });
    } finally {
      // onAuthStateChanged will eventually set loading to false after processing null user.
      // No need to setLoading(false) here directly as onAuthStateChanged is the source of truth for auth state.
    }
  }, [toast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true); 
      try {
        if (firebaseUser) {
          let userIsAdmin = false;
          // Check if the logged-in user's email matches the designated admin email
          if (firebaseUser.email && firebaseUser.email.toLowerCase() === siteConfig.adminEmail.toLowerCase()) {
            try {
              // Attempt to verify against Firestore 'admins' collection
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);
              if (adminDocSnap.exists()) {
                userIsAdmin = true;
              } else {
                // Email matches adminEmail, but UID not in 'admins' collection (when online)
                userIsAdmin = false; 
                // This scenario will be handled by AdminLoginPage's useEffect to sign out and toast.
                // No specific toast here, as AdminLoginPage is more context-aware for admin login attempts.
              }
            } catch (error) {
              // Firestore check failed (e.g., offline)
              console.error("Failed to check admin status from Firestore (possibly offline):", error);
              toast({
                title: "Admin Verification Issue",
                description: "Could not connect to server to verify full admin privileges. Proceeding with email-based admin access.",
                variant: "default", 
                duration: 7000,
              });
              userIsAdmin = true; // Fallback: if email is adminEmail and Firestore check fails, treat as admin
            }
          } else {
            // Email does not match adminEmail, definitely not admin through this path.
            // For other users, check if their UID is in 'admins' (e.g., if other admins could be added manually to Firestore)
            // For this app, we primarily focus on siteConfig.adminEmail.
            // If a general user (not siteConfig.adminEmail) logs in, they are not admin by default unless their UID is explicitly in 'admins'.
            // This maintains possibility of other Firestore-defined admins.
             try {
                const adminDocRef = doc(db, 'admins', firebaseUser.uid);
                const adminDocSnap = await getDoc(adminDocRef);
                userIsAdmin = adminDocSnap.exists();
            } catch (error) {
                console.error("Failed to check admin status for non-primary admin email:", error);
                userIsAdmin = false; // Default to non-admin if check fails
            }
          }
          
          const appUser: AppUser = {
            uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL, emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous, metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData, refreshToken: firebaseUser.refreshToken,
            tenantId: firebaseUser.tenantId, delete: firebaseUser.delete,
            getIdToken: firebaseUser.getIdToken, getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload, toJSON: firebaseUser.toJSON,
            providerId: firebaseUser.providerId, isAdmin: userIsAdmin,
          };
          
          setUser(appUser);
          setIsAdmin(userIsAdmin);

          // Redirection Logic
          if (userIsAdmin && pathname === '/admin/login') {
            router.push('/admin/dashboard');
          } else if (userIsAdmin && !pathname.startsWith('/admin') && !pathname.startsWith('/profile') && pathname !== '/') {
            // Optional: redirect admin to dashboard if they land on a non-admin, non-profile, non-home page
            // router.push('/admin/dashboard'); 
          } else if (!userIsAdmin && pathname.startsWith('/admin') && pathname !== '/admin/login') {
            toast({ title: "Access Denied", description: "You are not authorized to access this admin page.", variant: "destructive"});
            router.push('/'); 
          }
          // Note: If !userIsAdmin and on /admin/login (e.g. admin@gmail.com used, but UID not in Firestore 'admins' collection AND online),
          // AdminLoginPage's useEffect will handle toasting "Access Denied" and signing out.

        } else { // No firebaseUser (logged out)
          setUser(null);
          setIsAdmin(false);
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          } else if (pathname === '/profile') { // or other general protected routes
             router.push('/login?redirect=' + pathname);
          }
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged handling:", error);
        setUser(null); setIsAdmin(false);
        toast({variant: "destructive", title: "Authentication Error", description: "An error occurred during authentication."})
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in with Google." });
      setLoading(false); 
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email/Password sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or server error."});
      setLoading(false); 
      throw error; 
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut: performSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
