
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthProvider } from '@/contexts/AuthContext';
import { siteConfig } from '@/config/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto px-6 py-8"> {/* Increased px from 4 to 6 */}
              {children}
            </main>
            <AppFooter />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

