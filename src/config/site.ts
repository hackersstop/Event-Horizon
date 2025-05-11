export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  protected?: boolean; // Requires user login
  admin?: boolean; // Requires admin login
  icon?: React.ComponentType<{ className?: string }>;
};

export type SiteConfig = {
  name: string;
  description: string;
  mainNav: NavItem[];
  adminNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "EventHorizon",
  description: "Book amazing events with EventHorizon!",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "My Bookings",
      href: "/profile",
      protected: true,
    },
  ],
  adminNav: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      admin: true,
    },
    {
      title: "Add Event",
      href: "/admin/events/add",
      admin: true,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      admin: true,
    },
    {
      title: "Scan Ticket",
      href: "/admin/scan",
      admin: true,
    },
  ],
};
