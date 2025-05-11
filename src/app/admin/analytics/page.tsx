
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { BarChart3, Ticket, UsersRound, IndianRupee, CalendarClock, AlertTriangle } from 'lucide-react';
import { collection, getDocs, query, orderBy, Timestamp, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Event, Booking } from '@/types';
import { format, subDays, startOfDay } from 'date-fns';
import {
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';


interface AnalyticsStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  uniqueBookers: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface RevenueTimeSeriesData {
  date: string;
  revenue: number;
}

interface PopularEventData {
  name: string;
  bookings: number;
}

const INITIAL_STATS: AnalyticsStats = {
  totalEvents: 0,
  totalBookings: 0,
  totalRevenue: 0,
  uniqueBookers: 0,
};

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue (₹)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function AdminAnalyticsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AnalyticsStats>(INITIAL_STATS);
  const [bookingsTimeline, setBookingsTimeline] = useState<TimeSeriesData[]>([]);
  const [revenueTimeline, setRevenueTimeline] = useState<RevenueTimeSeriesData[]>([]);
  const [popularEvents, setPopularEvents] = useState<PopularEventData[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      // Fetch all events and bookings
      const eventsQuery = query(collection(db, 'events'));
      const bookingsQuery = query(collection(db, 'bookings'), orderBy('bookingDate', 'desc'));

      const [eventSnapshot, bookingSnapshot] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(bookingsQuery),
      ]);

      const allEvents = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      const allBookings = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

      // Calculate Key Metrics
      const totalEvents = allEvents.length;
      const totalBookings = allBookings.length;
      const totalRevenue = allBookings.reduce((sum, booking) => {
        const amount = booking.eventOfferAmount ?? booking.eventAmount ?? 0;
        return sum + amount;
      }, 0);
      const uniqueBookers = new Set(allBookings.map(b => b.userId)).size;

      setStats({ totalEvents, totalBookings, totalRevenue, uniqueBookers });

      // --- Process data for charts ---
      const daysToTrack = 7;
      const today = startOfDay(new Date());
      const timelineMap = new Map<string, { date: string; count: number; revenue: number }>();

      for (let i = 0; i < daysToTrack; i++) {
        const dateKey = format(subDays(today, i), 'MMM dd');
        timelineMap.set(dateKey, { date: dateKey, count: 0, revenue: 0 });
      }
      
      allBookings.forEach(booking => {
        if (booking.bookingDate instanceof Timestamp) {
          const bookingDay = startOfDay(booking.bookingDate.toDate());
          if (bookingDay >= subDays(today, daysToTrack -1) && bookingDay <= today) {
             const dateKey = format(bookingDay, 'MMM dd');
             const entry = timelineMap.get(dateKey);
             if (entry) {
               entry.count += 1;
               entry.revenue += (booking.eventOfferAmount ?? booking.eventAmount ?? 0);
             }
          }
        }
      });

      const sortedTimeline = Array.from(timelineMap.values()).sort((a,b) => new Date(a.date + ", " + today.getFullYear()) > new Date(b.date + ", " + today.getFullYear()) ? 1 : -1);
      setBookingsTimeline(sortedTimeline.map(d => ({ date: d.date, count: d.count })));
      setRevenueTimeline(sortedTimeline.map(d => ({ date: d.date, revenue: d.revenue })));


      // Popular Events (Top 5 by bookings)
      const eventBookingsCount: Record<string, { name: string; bookings: number }> = {};
      allBookings.forEach(booking => {
        const event = allEvents.find(e => e.id === booking.eventId);
        const eventName = event?.title || booking.eventId;
        if (!eventBookingsCount[booking.eventId]) {
          eventBookingsCount[booking.eventId] = { name: eventName, bookings: 0 };
        }
        eventBookingsCount[booking.eventId].bookings += 1;
      });
      const sortedPopularEvents = Object.values(eventBookingsCount)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);
      setPopularEvents(sortedPopularEvents);

    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsError("Failed to load analytics. Please try again.");
    } finally {
      setLoadingAnalytics(false);
    }
  };


  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login');
      } else {
        fetchAnalyticsData();
      }
    }
  }, [user, isAdmin, authLoading, router]);


  const statCards = useMemo(() => [
    { title: "Total Events", value: stats.totalEvents, icon: CalendarClock, color: "text-primary" },
    { title: "Total Bookings", value: stats.totalBookings, icon: Ticket, color: "text-secondary" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-accent" },
    { title: "Unique Bookers", value: stats.uniqueBookers, icon: UsersRound, color: "text-green-500" },
  ], [stats]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  if (loadingAnalytics) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-12 w-12 text-primary mr-3" />
        <p className="text-lg text-muted-foreground">Loading Analytics Dashboard...</p>
      </div>
    );
  }
  
  if (analyticsError) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/5 p-8 max-w-2xl mx-auto">
        <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-6" />
        <p className="text-2xl font-semibold text-destructive mb-2">Error Loading Analytics</p>
        <p className="text-md text-destructive/80 max-w-md mx-auto mb-4">
          {analyticsError}
        </p>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }


  return (
    <div className="animate-in fade-in-0 duration-500 ease-out space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Event Analytics</CardTitle>
          </div>
          <CardDescription>Track event performance, sales, and user engagement.</CardDescription>
        </CardHeader>
      </Card>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow animate-in fade-in-0 zoom-in-95 delay-100 fill-mode-both">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md animate-in fade-in-0 zoom-in-95 delay-200 fill-mode-both">
          <CardHeader>
            <CardTitle>Bookings Over Last 7 Days</CardTitle>
            <CardDescription>Daily booking trends.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart data={bookingsTimeline} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-bookings)" strokeWidth={2} dot={true} name="Bookings"/>
                 <Legend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md animate-in fade-in-0 zoom-in-95 delay-200 fill-mode-both">
          <CardHeader>
            <CardTitle>Revenue Over Last 7 Days</CardTitle>
            <CardDescription>Daily revenue trends (in ₹).</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart data={revenueTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}/>
                <YAxis 
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
                  tickLine={false} axisLine={false} tickMargin={8}
                />
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent indicator="line" formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={true} name="Revenue"/>
                <Legend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md animate-in fade-in-0 zoom-in-95 delay-300 fill-mode-both">
          <CardHeader>
            <CardTitle>Top 5 Popular Events</CardTitle>
            <CardDescription>Events with the most bookings.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             {popularEvents.length > 0 ? (
             <ChartContainer config={{}} className="w-full h-full">
                <BarChart data={popularEvents} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} interval={0} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[0, 4, 4, 0]} name="Bookings" />
                </BarChart>
              </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No booking data available to show popular events.</p>
                </div>
            )}
          </CardContent>
        </Card>

    </div>
  );
}

