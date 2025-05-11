
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
import type { AppUser, UserProfile } from '@/types';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';

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
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not sign out." });
    }
  }, [toast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true); 
      try {
        if (firebaseUser) {
          let userIsAdmin = false;
          
          if (firebaseUser.email && firebaseUser.email.toLowerCase() === siteConfig.adminEmail.toLowerCase()) {
            userIsAdmin = true;
            try {
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);
              if (!adminDocSnap.exists()) {
                 // If primary admin is not in 'admins' collection, add them.
                await setDoc(adminDocRef, { email: firebaseUser.email, addedAt: serverTimestamp() });
                console.warn(`Primary admin ${firebaseUser.email} (UID: ${firebaseUser.uid}) added to 'admins' Firestore collection.`);
              }
            } catch (error) {
              console.error("Firestore check/update for primary admin email UID failed (possibly offline):", error);
            }
          } else {
            try {
              const adminDocRef = doc(db, 'admins', firebaseUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);
              userIsAdmin = adminDocSnap.exists();
            } catch (error) {
              console.error("Failed to check admin status from Firestore for non-primary email (possibly offline):", error);
              userIsAdmin = false; 
              toast({
                title: "Admin Verification Issue",
                description: "Could not connect to server to verify admin privileges. Assuming non-admin.",
                variant: "default", 
                duration: 7000,
              });
            }
          }
          
          // Create or update user profile in Firestore
          const userProfileRef = doc(db, 'user_profiles', firebaseUser.uid);
          try {
            const userProfileSnap = await getDoc(userProfileRef);
            const profileDataToSet: Partial<UserProfile> = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
            };

            if (!userProfileSnap.exists()) {
                profileDataToSet.createdAt = serverTimestamp() as Timestamp;
                profileDataToSet.roles = userIsAdmin ? ['admin', 'user'] : ['user'];
            } else {
                // For existing users, update roles if necessary
                const existingProfile = userProfileSnap.data() as UserProfile;
                let rolesToUpdate = existingProfile.roles || ['user'];
                if (userIsAdmin && !rolesToUpdate.includes('admin')) {
                    rolesToUpdate = [...rolesToUpdate.filter(role => role !== 'user'), 'admin'];
                } else if (!userIsAdmin && rolesToUpdate.includes('admin')) {
                    rolesToUpdate = rolesToUpdate.filter(role => role !== 'admin');
                    if (!rolesToUpdate.includes('user')) rolesToUpdate.push('user');
                }
                 // Ensure 'user' role is present if not admin, or if admin also want to keep 'user'
                if (!rolesToUpdate.includes('user') && !rolesToUpdate.includes('admin')) {
                    rolesToUpdate.push('user');
                } else if (rolesToUpdate.includes('admin') && !rolesToUpdate.includes('user')) {
                    // Optional: decide if admins should also explicitly have 'user' role
                    // rolesToUpdate.push('user'); 
                }
                profileDataToSet.roles = [...new Set(rolesToUpdate)]; // Remove duplicates
            }
            await setDoc(userProfileRef, profileDataToSet, { merge: true });

          } catch (profileError) {
              console.error("Error saving user profile:", profileError);
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

          if (userIsAdmin && pathname === '/admin/login') {
            router.push('/admin/dashboard');
          } else if (!userIsAdmin && pathname.startsWith('/admin') && pathname !== '/admin/login') {
            toast({ title: "Access Denied", description: "You are not authorized to access this admin page.", variant: "destructive"});
            router.push('/'); 
          }

        } else { 
          setUser(null);
          setIsAdmin(false);
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          } else if (pathname === '/profile' || pathname.startsWith('/events/')) { 
             // Allow event detail pages for non-logged-in users
             if (pathname === '/profile') router.push('/login?redirect=' + pathname);
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
      // onAuthStateChanged will handle profile creation/update
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
      // onAuthStateChanged will handle profile creation/update
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
