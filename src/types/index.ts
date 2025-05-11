
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
  id: string; // Firestore document ID (unique, alphanumeric)
  userId: string;
  eventId: string;
  displayTicketId: string; // 8-digit numeric string for display
  eventTitle?: string; // Denormalized for easier display
  eventDate?: string; // Denormalized
  eventTime?: string; // Denormalized for event time
  bookingDate: Timestamp; 
  qrCodeData: string; // Contains the full Firestore booking.id for verification
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  verified: boolean;
  paymentCurrency?: string; // e.g., 'INR'
  userEmail?: string; // For admin view
  userPhone?: string; // Optional, for admin view
}

export interface AppUser extends FirebaseUser {
  isAdmin?: boolean;
}

export interface AdminConfig {
  id?: string; // Document ID if fetched
  appName?: string;
  appOwner?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
}

// Represents user data that might be stored in a separate 'users' collection
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null; // Typically collected separately
  createdAt: Timestamp;
  // other custom fields
}
