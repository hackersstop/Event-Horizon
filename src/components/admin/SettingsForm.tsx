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
// import { getAdminConfig, updateAdminConfig } from '@/actions/adminActions'; // Placeholder server actions

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
        // const config = await getAdminConfig(); // Fetch current config
        // Mock fetch
        const mockConfig: AdminConfig = {
            razorpayKeyId: 'rzp_test_12345',
            razorpayKeySecret: 'test_secret',
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpUser: 'user@example.com',
            smtpPass: 'password',
            smtpFromEmail: 'noreply@example.com'
        };
        reset(mockConfig); // Populate form with fetched data
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load settings.' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadConfig();
  }, [reset, toast]);

  const onSubmit: SubmitHandler<SettingsFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      // In a real app, call a server action:
      // const result = await updateAdminConfig(data);
      // if (result.success) {
      //   toast({ title: 'Settings Updated!', description: 'Configuration saved successfully.' });
      // } else {
      //   toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to update settings.' });
      // }
      
      // Mock success
      console.log('Settings data submitted:', data);
      toast({ title: 'Settings Updated! (Mock)', description: 'Configuration would be saved.' });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
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
        <h3 className="text-xl font-semibold flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" /> Razorpay Settings</h3>
        <div>
          <Label htmlFor="razorpayKeyId">Key ID</Label>
          <Input id="razorpayKeyId" {...register('razorpayKeyId')} />
        </div>
        <div>
          <Label htmlFor="razorpayKeySecret">Key Secret</Label>
          <Input id="razorpayKeySecret" type="password" {...register('razorpayKeySecret')} />
        </div>
      </section>

      <section className="space-y-4 p-6 border rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" /> SMTP Settings</h3>
        <div>
          <Label htmlFor="smtpHost">Host</Label>
          <Input id="smtpHost" {...register('smtpHost')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtpPort">Port</Label>
            <Input id="smtpPort" type="number" {...register('smtpPort')} />
          </div>
          <div>
            <Label htmlFor="smtpUser">Username</Label>
            <Input id="smtpUser" {...register('smtpUser')} />
          </div>
        </div>
        <div>
          <Label htmlFor="smtpPass">Password</Label>
          <Input id="smtpPass" type="password" {...register('smtpPass')} />
        </div>
        <div>
          <Label htmlFor="smtpFromEmail">From Email</Label>
          <Input id="smtpFromEmail" type="email" {...register('smtpFromEmail')} aria-invalid={errors.smtpFromEmail ? "true" : "false"}/>
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
