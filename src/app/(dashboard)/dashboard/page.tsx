"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getDB, getUpcomingBookings, getRecentLogs } from "@/lib/store";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CalendarDays, Dumbbell, TrendingUp, ArrowRight, Clock } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  YOGA: "🧘", HIIT: "⚡", STRENGTH: "💪", CARDIO: "🏃", PILATES: "🤸",
  SPINNING: "🚴", ZUMBA: "💃", BOXING: "🥊", CROSSFIT: "🏋️", MEDITATION: "🧠",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcoming = getUpcomingBookings(user.id, 3);
  const recentLogs = getRecentLogs(user.id, 3);
  const firstName = user.name?.split(" ")[0] || "Champ";

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 mt-1">Let&apos;s crush today&apos;s goals. 💪</p>
        </div>
        <Link href="/classes">
          <Button size="lg">Book a Class <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Classes", value: upcoming.length, sub: "upcoming", icon: CalendarDays, color: "from-blue-500 to-blue-600" },
          { label: "Workouts", value: recentLogs.length, sub: "this month", icon: Dumbbell, color: "from-primary-500 to-primary-600" },
          { label: "Streak", value: "5", sub: "days active", icon: TrendingUp, color: "from-accent-500 to-accent-600" },
          { label: "Membership", value: "Active", sub: "Premium plan", icon: TrendingUp, color: "from-green-500 to-green-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} padding="sm" className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.sub}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <Link href="/classes" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </CardHeader>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming classes</p>
              <Link href="/classes" className="text-sm text-primary-600 font-medium mt-1 inline-block">Book your first class</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-lg">
                      {TYPE_ICONS[booking.class?.type || ""] || "💪"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{booking.class?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {booking.class?.startTime} - {booking.class?.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Booked</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <Link href="/workouts" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </CardHeader>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent workouts</p>
              <Link href="/workouts" className="text-sm text-primary-600 font-medium mt-1 inline-block">Start a workout</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{log.workout?.title || "Workout"}</p>
                      <p className="text-xs text-gray-500">{log.duration} min • {new Date(log.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">{log.workout?.difficulty || "BEGINNER"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/classes", label: "Class Schedule", icon: "📅" },
          { href: "/workouts", label: "Workout Library", icon: "🏋️" },
          { href: "/progress", label: "My Progress", icon: "📈" },
          { href: "/membership", label: "Membership", icon: "💳" },
        ].map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
