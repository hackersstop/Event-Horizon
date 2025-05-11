
/**
 * Generates a numeric hash from a string.
 * @param str The input string (e.g., Firestore ID).
 * @returns A positive number.
 */
function simpleNumericHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates an 8-digit numeric string for display purposes from a Firestore booking ID.
 * Note: This generated ID is for display and easier human reference.
 * It's derived and might have collisions, though unlikely for typical Firestore ID entropy.
 * The original Firestore ID should always be used for database lookups and QR code verification.
 * @param firestoreBookingId The unique alphanumeric Firestore document ID.
 * @returns An 8-digit numeric string.
 */
export function generateDisplayTicketId(firestoreBookingId: string): string {
  const hashedValue = simpleNumericHash(firestoreBookingId);
  // Take modulo to get a number that can be padded to 8 digits
  const eightDigitNumber = hashedValue % 100000000; 
  return eightDigitNumber.toString().padStart(8, '0');
}
