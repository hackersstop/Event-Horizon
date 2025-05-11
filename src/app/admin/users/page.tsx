
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck, ShieldOff, AlertTriangle, UserCog, Search } from 'lucide-react';
import type { UserProfile } from '@/types';
import { collection, getDocs, query, orderBy, Timestamp, doc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUsersPage() {
  const { user: adminUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // UID -> isLoading

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const usersCol = collection(db, 'user_profiles');
      const q = query(usersCol, orderBy('createdAt', 'desc'));
      const userSnapshot = await getDocs(q);
      
      const userListPromises = userSnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as Omit<UserProfile, 'uid' | 'createdAt'> & { createdAt: Timestamp | Date, roles?: string[] }; // Adjust type for createdAt
        
        const adminDocRef = doc(db, 'admins', docSnapshot.id);
        const adminDocSnap = await getDoc(adminDocRef);
        const isActuallyAdmin = adminDocSnap.exists() || data.email === siteConfig.adminEmail;

        let currentRoles = data.roles && Array.isArray(data.roles) ? [...data.roles] : [];
        let rolesChanged = false;

        // Ensure new users or users without roles get 'user' role by default (unless they are the primary admin being set up)
        if (currentRoles.length === 0 && data.email !== siteConfig.adminEmail) {
            currentRoles.push('user');
            rolesChanged = true;
        }
        
        if (isActuallyAdmin) {
            if (!currentRoles.includes('admin')) {
                currentRoles.push('admin');
                rolesChanged = true;
            }
            // Ensure admin also has 'user' role for consistency with AuthContext initial setup
            if (!currentRoles.includes('user')) {
                currentRoles.push('user');
                rolesChanged = true;
            }
        } else { // Not actually admin
            if (currentRoles.includes('admin') && data.email !== siteConfig.adminEmail) {
                currentRoles = currentRoles.filter(r => r !== 'admin');
                rolesChanged = true;
            }
            // Ensure 'user' role is present if they are not admin
            if (!currentRoles.includes('user')) {
                currentRoles.push('user');
                rolesChanged = true;
            }
        }
        
        const finalRoles = [...new Set(currentRoles)]; // Remove duplicates
        // Check if roles actually changed before updating Firestore
        const originalRolesSorted = [...(data.roles || [])].sort().join(',');
        const finalRolesSorted = [...finalRoles].sort().join(',');

        if (originalRolesSorted !== finalRolesSorted) {
            await updateDoc(doc(db, 'user_profiles', docSnapshot.id), { roles: finalRoles });
            data.roles = finalRoles; // Update data object for immediate use
        }

        return {
          uid: docSnapshot.id,
          ...data,
          // Convert Firestore Timestamp to Date for consistent handling, or ensure it's already a Date
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : (data.createdAt ? new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds) : Timestamp.now()),
          roles: finalRoles,
        } as UserProfile;
      });
      const userList = await Promise.all(userListPromises);
      setUsers(userList);

    } catch (error) {
      console.error("Error fetching users: ", error);
      setErrorUsers("Failed to load users. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch users from the database.",
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!adminUser || !isAdmin) {
        router.push('/admin/login');
      } else {
        fetchUsers();
      }
    }
  }, [adminUser, isAdmin, authLoading, router, fetchUsers]);

  const handleRoleChange = async (targetUser: UserProfile, makeAdmin: boolean) => {
    if (!adminUser || targetUser.uid === adminUser.uid) {
      toast({ variant: "destructive", title: "Action Denied", description: "Cannot change your own role." });
      return;
    }
    if (targetUser.email === siteConfig.adminEmail) {
      toast({ variant: "destructive", title: "Action Denied", description: `Role of primary admin (${siteConfig.adminEmail}) cannot be changed here.` });
      return;
    }

    setActionLoading(prev => ({ ...prev, [targetUser.uid]: true }));
    try {
      const adminDocRef = doc(db, 'admins', targetUser.uid);
      const userProfileDocRef = doc(db, 'user_profiles', targetUser.uid);

      if (makeAdmin) {
        await setDoc(adminDocRef, { email: targetUser.email, managedBy: adminUser.uid, managedAt: serverTimestamp() });
        // Ensure both 'admin' and 'user' roles are present
        await updateDoc(userProfileDocRef, { roles: arrayUnion('admin', 'user') });
        toast({ title: "Role Updated", description: `${targetUser.displayName || targetUser.email} is now an admin.` });
      } else {
        await deleteDoc(adminDocRef);
        // Remove 'admin' role and ensure 'user' role is present
        await updateDoc(userProfileDocRef, { roles: arrayRemove('admin') });
        await updateDoc(userProfileDocRef, { roles: arrayUnion('user') });
        toast({ title: "Role Updated", description: `${targetUser.displayName || targetUser.email} is no longer an admin.` });
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error changing role:", error);
      toast({ variant: "destructive", title: "Error Updating Role", description: "Could not update user role." });
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUser.uid]: false }));
    }
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.uid.toLowerCase().includes(search)
    );
  });


  if (authLoading || !adminUser || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in-0 duration-500 ease-out space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCog className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Manage Users</CardTitle>
              <CardDescription className="mt-1">View user details and manage their roles.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loadingUsers ? (
            <div className="flex justify-center items-center py-16">
              <Spinner className="h-12 w-12 text-primary" />
            </div>
          ) : errorUsers ? (
            <div className="text-center py-16 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/5 p-8">
              <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-6" />
              <p className="text-2xl font-semibold text-destructive mb-2">Error Loading Users</p>
              <p className="text-md text-destructive/80 max-w-md mx-auto">
                {errorUsers}
              </p>
              <Button onClick={fetchUsers} className="mt-6" variant="destructive">
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={u.photoURL || undefined} alt={u.displayName || u.email || 'User'} />
                          <AvatarFallback>{(u.displayName || u.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.displayName || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[100px]" title={u.uid}>UID: {u.uid}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.createdAt instanceof Timestamp ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {u.roles?.map(role => (
                          <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {role}
                          </Badge>
                        ))}
                         {(!u.roles || u.roles.length === 0) && <Badge variant="outline">No Roles</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       {u.email === siteConfig.adminEmail ? (
                         <Badge variant="destructive">Primary Admin</Badge>
                       ) : u.uid === adminUser.uid ? (
                         <Badge variant="outline">Your Account</Badge>
                       ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button 
                                variant={u.roles?.includes('admin') ? "destructive" : "outline"} 
                                size="sm"
                                disabled={actionLoading[u.uid]}
                              >
                                {actionLoading[u.uid] && <Spinner className="mr-2 h-3 w-3" />}
                                {u.roles?.includes('admin') ? <ShieldOff className="mr-1 h-4 w-4" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
                                {u.roles?.includes('admin') ? 'Revoke Admin' : 'Make Admin'}
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to {u.roles?.includes('admin') ? 'revoke admin access for' : 'grant admin access to'} {u.displayName || u.email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={actionLoading[u.uid]}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRoleChange(u, !u.roles?.includes('admin'))}
                                className={u.roles?.includes('admin') ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
                                disabled={actionLoading[u.uid]}
                              >
                                {actionLoading[u.uid] && <Spinner className="mr-2 h-3 w-3" />}
                                {u.roles?.includes('admin') ? 'Yes, Revoke Admin' : 'Yes, Make Admin'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <p className="text-2xl font-semibold text-muted-foreground mb-2">No Users Found.</p>
              <p className="text-md text-muted-foreground max-w-md mx-auto">
                {searchTerm ? "No users match your search criteria." : "No user profiles exist in the database yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

