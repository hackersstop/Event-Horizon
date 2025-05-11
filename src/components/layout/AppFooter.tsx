
import { siteConfig } from '@/config/site';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-right">
          Developed by{' '}
          <Link
            href="https://unikodex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            unikodex
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}

