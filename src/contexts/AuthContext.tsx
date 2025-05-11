
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
    setLoading(true); 
    try {
      await firebaseSignOut(auth);
      // setUser, setIsAdmin will be updated by onAuthStateChanged to null/false.
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not sign out." });
    } finally {
      // onAuthStateChanged will eventually set loading to false after processing null user.
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
            // User with the siteConfig.adminEmail is always an admin.
            userIsAdmin = true;
            // Optional: You can still check Firestore for this UID for consistency or logging,
            // but their admin status is already granted.
            try {
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);
              if (!adminDocSnap.exists()) {
                console.warn(`Admin user ${firebaseUser.email} (UID: ${firebaseUser.uid}) is not in the 'admins' Firestore collection. Access granted based on siteConfig.adminEmail.`);
                // Consider adding this UID to 'admins' collection automatically if this is the first time,
                // or instructing the admin to do so manually. For now, simply granting access is sufficient.
              }
            } catch (error) {
              // Firestore check failed (e.g., offline for the primary admin's UID check)
              console.error("Firestore check for primary admin email UID failed (possibly offline):", error);
              // No toast needed here as admin access is already granted based on email.
            }
          } else {
            // For any other email, check the 'admins' collection in Firestore.
            try {
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);
              userIsAdmin = adminDocSnap.exists();
            } catch (error) {
              console.error("Failed to check admin status from Firestore for non-primary email (possibly offline):", error);
              userIsAdmin = false; // Default to non-admin if Firestore check fails for other emails
              toast({
                title: "Admin Verification Issue",
                description: "Could not connect to server to verify admin privileges for this account. Assuming non-admin.",
                variant: "default", 
                duration: 7000,
              });
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
          } else if (!userIsAdmin && pathname.startsWith('/admin') && pathname !== '/admin/login') {
            toast({ title: "Access Denied", description: "You are not authorized to access this admin page.", variant: "destructive"});
            router.push('/'); 
          }

        } else { // No firebaseUser (logged out)
          setUser(null);
          setIsAdmin(false);
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          } else if (pathname === '/profile') { 
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
      // onAuthStateChanged will handle setting user, isAdmin, and loading states
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

