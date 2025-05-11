
import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string; // ISO string or YYYY-MM-DD
  time: string; // HH:MM
  offerAmount?: number;
  amount: number;
  imageUrl: string;
  createdAt?: Timestamp; 
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  eventTitle?: string; // Denormalized for easier display
  eventDate?: string; // Denormalized
  eventTime?: string; // Denormalized for event time
  bookingDate: Timestamp; 
  qrCodeData: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  verified: boolean;
  paymentCurrency?: string; // e.g., 'INR'
}

export interface AppUser extends FirebaseUser {
  isAdmin?: boolean;
}

export interface AdminConfig {
  id?: string; // Document ID if fetched
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
}

