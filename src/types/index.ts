import type { User as FirebaseUser } from 'firebase/auth';

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
  createdAt?: any; // Firestore Timestamp
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  eventTitle?: string; // Denormalized for easier display
  eventDate?: string; // Denormalized
  bookingDate: any; // Firestore Timestamp
  qrCodeData: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  verified: boolean;
}

export interface AppUser extends FirebaseUser {
  isAdmin?: boolean;
}

export interface AdminConfig {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
}
