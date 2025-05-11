'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { AdminConfig } from '@/types';
import { Loader2, Save, CreditCard, Mail } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const settingsSchema = z.object({
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFromEmail: z.string().email({ message: "Invalid email for SMTP From Email"}).optional().or(z.literal('')),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

const ADMIN_CONFIG_DOC_PATH = 'app_config/admin_settings'; // Define a consistent path

export function SettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormInputs>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    async function loadConfig() {
      setIsLoadingData(true);
      try {
        const configDocRef = doc(db, ADMIN_CONFIG_DOC_PATH);
        const configDocSnap = await getDoc(configDocRef);
        if (configDocSnap.exists()) {
          reset(configDocSnap.data() as AdminConfig);
        } else {
          // Set default empty values if no config exists
          reset({ 
            razorpayKeyId: '', 
            razorpayKeySecret: '', 
            smtpHost: '', 
            smtpPort: undefined, 
            smtpUser: '', 
            smtpPass: '', 
            smtpFromEmail: '' 
          });
          toast({ title: 'Info', description: 'No existing admin configuration found. Displaying defaults.' });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({ variant: 'destructive', title: 'Error Loading Settings', description: 'Could not fetch current admin settings.' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadConfig();
  }, [reset, toast]);

  const onSubmit: SubmitHandler<SettingsFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const configDocRef = doc(db, ADMIN_CONFIG_DOC_PATH);
      // Use setDoc with merge:true to update or create the document
      await setDoc(configDocRef, data, { merge: true }); 
      
      toast({ title: 'Settings Updated!', description: 'Configuration saved successfully.' });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({ variant: 'destructive', title: 'Error Saving Settings', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4 p-6 border rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" /> Razorpay Settings (INR Payments)</h3>
        <div>
          <Label htmlFor="razorpayKeyId">Key ID</Label>
          <Input id="razorpayKeyId" {...register('razorpayKeyId')} placeholder="rzp_live_xxxxxxxxxxxxxx" />
        </div>
        <div>
          <Label htmlFor="razorpayKeySecret">Key Secret</Label>
          <Input id="razorpayKeySecret" type="password" {...register('razorpayKeySecret')} placeholder="Enter your Razorpay Key Secret" />
        </div>
      </section>

      <section className="space-y-4 p-6 border rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" /> SMTP Settings</h3>
        <div>
          <Label htmlFor="smtpHost">Host</Label>
          <Input id="smtpHost" {...register('smtpHost')} placeholder="smtp.example.com" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtpPort">Port</Label>
            <Input id="smtpPort" type="number" {...register('smtpPort')} placeholder="587" />
          </div>
          <div>
            <Label htmlFor="smtpUser">Username</Label>
            <Input id="smtpUser" {...register('smtpUser')} placeholder="user@example.com" />
          </div>
        </div>
        <div>
          <Label htmlFor="smtpPass">Password</Label>
          <Input id="smtpPass" type="password" {...register('smtpPass')} placeholder="Enter SMTP password" />
        </div>
        <div>
          <Label htmlFor="smtpFromEmail">From Email</Label>
          <Input id="smtpFromEmail" type="email" {...register('smtpFromEmail')} placeholder="noreply@example.com" aria-invalid={errors.smtpFromEmail ? "true" : "false"}/>
          {errors.smtpFromEmail && <p className="text-sm text-destructive mt-1">{errors.smtpFromEmail.message}</p>}
        </div>
      </section>

      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" disabled={isSubmitting || isLoadingData}>
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        {isSubmitting ? 'Saving Settings...' : 'Save Settings'}
      </Button>
    </form>
  );
}
