'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
// import { createEvent } from '@/actions/eventActions'; // Placeholder for server action
import type { Event } from '@/types';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  offerAmount: z.coerce.number().positive('Offer amount must be a positive number').optional(),
  imageUrl: z.string().url('Invalid URL format'),
});

type EventFormInputs = z.infer<typeof eventSchema>;

export function AddEventForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit: SubmitHandler<EventFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      // const newEvent: Omit<Event, 'id' | 'createdAt'> = data;
      // In a real app, call a server action:
      // const result = await createEvent(newEvent);
      // if (result.success) {
      //   toast({ title: 'Event Created!', description: `${data.title} has been successfully added.` });
      //   reset();
      // } else {
      //   toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to create event.' });
      // }
      
      // Mock success
      console.log('Event data submitted:', data);
      toast({ title: 'Event Created! (Mock)', description: `${data.title} would be added.` });
      reset(); // Reset form fields
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" {...register('title')} aria-invalid={errors.title ? "true" : "false"} />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} aria-invalid={errors.description ? "true" : "false"} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} aria-invalid={errors.location ? "true" : "false"} />
          {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} aria-invalid={errors.date ? "true" : "false"} />
          {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="time">Time (HH:MM)</Label>
          <Input id="time" type="time" {...register('time')} aria-invalid={errors.time ? "true" : "false"} />
          {errors.time && <p className="text-sm text-destructive mt-1">{errors.time.message}</p>}
        </div>
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input id="amount" type="number" step="0.01" {...register('amount')} aria-invalid={errors.amount ? "true" : "false"} />
          {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="offerAmount">Offer Amount ($) (Optional)</Label>
        <Input id="offerAmount" type="number" step="0.01" {...register('offerAmount')} aria-invalid={errors.offerAmount ? "true" : "false"} />
        {errors.offerAmount && <p className="text-sm text-destructive mt-1">{errors.offerAmount.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl">Event Image URL</Label>
        <Input id="imageUrl" type="url" placeholder="https://example.com/image.jpg" {...register('imageUrl')} aria-invalid={errors.imageUrl ? "true" : "false"} />
        {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        {isSubmitting ? 'Saving Event...' : 'Create Event'}
      </Button>
    </form>
  );
}
