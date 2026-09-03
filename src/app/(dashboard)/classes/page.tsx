"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getDB, getClasses, bookClass, getUserBooking } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CLASS_TYPE_ICONS, CLASS_TYPE_COLORS, DAYS_OF_WEEK, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

const CLASS_TYPES = ["ALL", "YOGA", "HIIT", "STRENGTH", "CARDIO", "PILATES", "SPINNING", "ZUMBA", "BOXING", "CROSSFIT", "MEDITATION"];

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      await getDB();
      setReady(true);
    })();
  }, []);

  const nextDate = (dow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7));
    return d.toISOString();
  };

  const handleBook = (classId: string, dayOfWeek: number) => {
    if (!user) return;
    const result = bookClass(user.id, classId, nextDate(dayOfWeek));
    setMsg(result.waitlisted ? "You've joined the waitlist!" : result.ok ? "Class booked! 🎉" : result.error || "Booking failed");
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading || !user || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const classes = getClasses(filter);
  const filtered = selectedDay !== null ? classes.filter((c) => c.dayOfWeek === selectedDay) : classes;
  const today = new Date().getDay();

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
        <p className="text-gray-600 mt-1">Find and book your next workout</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 animate-slide-down">
          {msg}
        </div>
      )}

      <Card padding="sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DAYS_OF_WEEK.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(selectedDay === i ? null : i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedDay === i
                  ? "bg-primary-600 text-white shadow-sm"
                  : i === today
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CLASS_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === type ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {type === "ALL" ? "🏠 All" : `${CLASS_TYPE_ICONS[type] || "💪"} ${type.charAt(0) + type.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No classes found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => {
            const bookedCount = cls._count?.bookings || 0;
            const isFull = bookedCount >= cls.capacity;
            const isBooked = !!getUserBooking(user.id, cls.id);
            return (
              <Card key={cls.id} hover padding="md" className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{CLASS_TYPE_ICONS[cls.type] || "💪"}</span>
                  <Badge className={CLASS_TYPE_COLORS[cls.type] || "bg-gray-100 text-gray-800"}>{cls.type}</Badge>
                </div>
                <Link href={`/classes/${cls.id}`}>
                  <h3 className="font-bold text-gray-900 mb-1 hover:text-primary-600 transition-colors">{cls.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cls.description}</p>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-400" /><span>{DAYS_OF_WEEK[cls.dayOfWeek]}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>{formatTime(cls.startTime)} - {formatTime(cls.endTime)} ({cls.duration} min)</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span>{cls.room}</span></div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className={isFull ? "text-red-500 font-medium" : ""}>
                      {bookedCount}/{cls.capacity} booked{isFull && " • Full"}
                    </span>
                  </div>
                </div>
                <div className="mt-auto">
                  {isBooked ? (
                    <Link href={`/classes/${cls.id}`}>
                      <Button variant="outline" className="w-full">View Booking</Button>
                    </Link>
                  ) : (
                    <Button onClick={() => handleBook(cls.id, cls.dayOfWeek)} disabled={isFull} className="w-full">
                      {isFull ? "Join Waitlist" : "Book Now"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
