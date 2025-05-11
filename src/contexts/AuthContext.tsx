
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
    await firebaseSignOut(auth);
    // setUser, setIsAdmin, and loading states will be updated by onAuthStateChanged.
    // Redirection will also be handled by onAuthStateChanged based on the new null user state.
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
  }, [toast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true); // Set loading true at the very start of handling state change
      try {
        if (firebaseUser) {
          let userIsAdmin = false;
          try {
            const adminDocRef = doc(db, 'admins', firebaseUser.uid);
            const adminDocSnap = await getDoc(adminDocRef); // Await this properly
            userIsAdmin = adminDocSnap.exists();
          } catch (error) {
            console.error("Failed to check admin status (possibly offline):", error);
            toast({
              title: "Network Issue",
              description: "Could not verify admin status. Assuming non-admin role.",
              variant: "default", 
              duration: 5000,
            });
            // userIsAdmin remains false, a safe default.
          }
          
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData,
            refreshToken: firebaseUser.refreshToken,
            tenantId: firebaseUser.tenantId,
            delete: firebaseUser.delete,
            getIdToken: firebaseUser.getIdToken,
            getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload,
            toJSON: firebaseUser.toJSON,
            providerId: firebaseUser.providerId,
            isAdmin: userIsAdmin,
          };
          
          setUser(appUser);
          setIsAdmin(userIsAdmin);

          // Redirection logic based on confirmed admin status
          if (userIsAdmin && pathname === '/admin/login') {
            router.push('/admin/dashboard');
          } else if (userIsAdmin && !pathname.startsWith('/admin')) {
            // Optional: redirect admin to dashboard if they land on a non-admin page
            // router.push('/admin/dashboard'); 
          } else if (!userIsAdmin && pathname.startsWith('/admin') && pathname !== '/admin/login') {
            // Non-admin trying to access a protected admin page (not the login page itself)
            toast({ title: "Access Denied", description: "You are not authorized to access this admin page.", variant: "destructive"});
            // Consider signing them out or just redirecting. For now, redirecting.
            // await performSignOut(); // This would sign them out.
            router.push('/'); 
          }
          // If !userIsAdmin and on /admin/login, they attempted admin login.
          // The AdminLoginPage's useEffect will handle toasting "Access Denied" and signing them out.

        } else { // No firebaseUser (logged out)
          setUser(null);
          setIsAdmin(false);
          // Redirect if on a protected page and now logged out
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          } else if (pathname === '/profile') {
             router.push('/login?redirect=/profile');
          }
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged handling:", error);
        setUser(null);
        setIsAdmin(false);
        toast({variant: "destructive", title: "Authentication Error", description: "An error occurred during authentication."})
      } finally {
        setLoading(false); // Set loading false after all processing (including admin check) is done
      }
    });

    return () => unsubscribe();
  }, [router, pathname, toast]); // performSignOut removed as it's not called directly within this effect

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged handles setting user, admin state, and final setLoading(false)
      // A general "Login successful" toast can be shown by the page they are redirected to, or not at all.
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
      // onAuthStateChanged will handle user, admin state update, and final setLoading(false)
    } catch (error: any) {
      console.error("Email/Password sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or server error."});
      setLoading(false); 
      throw error; // Re-throw to allow AdminLoginPage to know about the failure
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut: performSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

