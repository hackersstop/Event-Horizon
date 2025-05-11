import { siteConfig } from '@/config/site';

export function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Next.js and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
