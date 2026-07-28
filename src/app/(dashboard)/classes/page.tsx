"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CLASS_TYPE_ICONS, CLASS_TYPE_COLORS, DAYS_OF_WEEK, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, Users, Search, Filter } from "lucide-react";

const CLASS_TYPES = ["ALL", "YOGA", "HIIT", "STRENGTH", "CARDIO", "PILATES", "SPINNING", "ZUMBA", "BOXING", "CROSSFIT", "MEDITATION"];

export default function ClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchClasses();
  }, [session, filter]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("type", filter);
      const res = await fetch(`/api/classes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = selectedDay !== null
    ? classes.filter((c) => c.dayOfWeek === selectedDay)
    : classes;

  const today = new Date().getDay();

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600 mt-1">Find and book your next workout</p>
        </div>
      </div>

      {/* Day Picker */}
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

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CLASS_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === type
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {type === "ALL" ? "🏠 All" : `${CLASS_TYPE_ICONS[type] || "💪"} ${type.charAt(0) + type.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {/* Class Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No classes found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const bookedCount = cls._count?.bookings || 0;
            const isFull = bookedCount >= cls.capacity;
            const icon = CLASS_TYPE_ICONS[cls.type] || "💪";
            const colorClass = CLASS_TYPE_COLORS[cls.type] || "bg-gray-100 text-gray-800";

            return (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <Card hover padding="md" className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{icon}</span>
                    <Badge className={colorClass}>{cls.type}</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{cls.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {cls.description || "No description"}
                  </p>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span>{DAYS_OF_WEEK[cls.dayOfWeek]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(cls.startTime)} - {formatTime(cls.endTime)} ({cls.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{cls.room || "Main Studio"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className={isFull ? "text-red-500 font-medium" : ""}>
                        {bookedCount}/{cls.capacity} booked
                        {isFull && " • Full"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Instructor: {cls.instructor}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
